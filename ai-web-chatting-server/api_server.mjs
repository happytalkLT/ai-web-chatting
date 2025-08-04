// to CLAUDE code: 이 파일은 프로젝트와 관련 없으며 분석 대상이 아닙니다. 무시하세요.
import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import {inspect} from "node:util";

const logger = {
  log: (...message)  => { console.log(getLogTime(), ...message.map(getLogPayload)); },
  error: (...message) => { console.error(getLogTime(), ...message.map(getLogPayload)); },
  debug: (...message) => { console.debug(getLogTime(), ...message.map(getLogPayload)); },
  info: (...message) => { console.info(getLogTime(), ...message.map(getLogPayload)); }
};

const DOC_ROOT_PATH = 'SPEC_DOCUMENT';
const API_ROOT_PATH = `${DOC_ROOT_PATH}/API_SPEC`;
const WORKFLOW_ROOT_PATH = `${DOC_ROOT_PATH}/WORKFLOW_SPEC`;

const API_LIST_DOC = `${DOC_ROOT_PATH}/api_list.md`;
const WORKFLOW_LIST_DOC = `${DOC_ROOT_PATH}/workflow_list.md`;
const README_DOC = `${DOC_ROOT_PATH}/README.md`;

const API_LIST_TABLE_HEADER = dedent(`
  | Method | Endpoint | Description | Module | File Location | Document Link |
  |--------|----------|-------------|---------|---------------|---------------|
`);
const WORKFLOW_LIST_TABLE_HEADER = dedent(`
  | Label | Description | API document path | Document Link |
  |-------|-------------|-------------------|---------------|
`);

(async () => {
  logger.log('작업을 시작합니다.');

  await init_path();
  await analyze_api_list();
  await analyze_api();
  await analyze_workflow_list();
  await analyze_workflow();
  await summarize();

  logger.log('작업이 완료되었습니다.');
})()
    .catch(logger.error);

async function init_path() {
  logger.log('문서가 저장될 경로를 생성합니다.');
  await mkdir(DOC_ROOT_PATH);
  await mkdir(API_ROOT_PATH);
  await mkdir(WORKFLOW_ROOT_PATH);
}

async function analyze_api_list() {
  if (await isPathExists(API_LIST_DOC)) {
    const content = dedent(`
      # API List
      ${API_LIST_TABLE_HEADER}
    `);
    await fs.writeFile(API_LIST_DOC, content, 'utf-8');
  }

  logger.log('API 목록을 작성합니다.');

  const prompt = dedent(`
    코드베이스에서 제공하는 API를 작성해야 합니다.
    테이블의 헤더는 다음과 같습니다.
    ${API_LIST_TABLE_HEADER}

    수행해야 할 PseudoCode입니다.
    <PseudoCode>
      전체 코드베이스를 분석하면서:
        if (API Endpoint를 발견할 때마다):
          if ("${API_LIST_DOC}" 파일의 API List 테이블에 해당 항목이 없다면):
            테이블에 항목 추가 (
              - "document link" column: "@todo"로 작성
              - "File Location" column: "{file_path}:{start_line_number}-{end_line_number}" 포맷으로 작성
            );
    </PseudoCode>
  `);

  await query(prompt);
  logger.log('API 목록 작성이 완료되었습니다.');
}

async function analyze_api() {
  const apiListContents = await fs.readFile(API_LIST_DOC, { encoding: 'utf8'});
  const tables = searchMarkdownTables(apiListContents);

  for (const table of tables) {
    const todoRows = table.rows.filter(row => row.match(/^.+@todo.*[|].*$/gm));

    if (todoRows !== null) {
      for (const todoRow of todoRows) {
        await analyze_api_item(table.header, todoRow);
      }
    }
  }
}

async function analyze_api_item(header, apiRow) {
  const titles = header.split('|').map(item => item.trim());
  const context = [
    header,
    `|${'---|'.repeat(titles.length - 2)}`,
    apiRow,
  ].join('\n');

  const descriptionIndex = titles.findIndex(title => {
    return title.toLowerCase() === 'description';
  });
  const description = apiRow.split('|')[descriptionIndex].trim().replace(/\s+/g, '_');
  const filePath = `${API_ROOT_PATH}/${description}.md`;

  logger.log(`API 문서 생성 시작: ${filePath}`);

  const prompt = dedent(`
    다음 API에 대한 스펙 문서를 작성해야 합니다.
    (제공된 정보를 바탕으로 해당 API를 구성하는 코드 전체를 분석하세요.)
    ${context}

    "${filePath}" 파일에 다음 내용을 작성해 주세요.
    (각각의 API 문서는 독립적이므로 다른 문서에 대한 참조와 생략이 금지됩니다.)
    (반드시 상세하게 작성하세요.)

    <FORMAT>
      # {타이틀: API 이름}
      ## 개요
      API의 역할에 대한 상세한 설명

      ## Request
      ### Endpoint
      테이블로 작성해 주세요. method, path 항목이 있어야 합니다.

      ### Path Parameters
      테이블로 작성해 주세요. 파라미터, 타입, 필수 여부, 설명 항목이 있어야 합니다.

      ### Query Parameters
      테이블로 작성해 주세요. 파라미터, 타입, 필수 여부, 설명 항목이 있어야 합니다.

      ### Request Headers
      테이블로 작성해 주세요. 헤더, 필수 여부, 설명 항목이 있어야 합니다.

      ### Request Body
      테이블로 작성해 주세요. 파라미터, 타입, 필수 여부, 설명 항목이 있어야 합니다.

      ### 인증 방식
      상세한 설명으로 작성해 주세요.

      ## Response
      ### Response Status
      테이블로 작성해 주세요. http status, 설명 항목이 있어야 합니다.

      ### Response Headers
      테이블로 작성해 주세요. 헤더, 필수 여부, 설명 항목이 있어야 합니다.
      
      ### Response Body
      테이블로 작성해 주세요. 필드, 타입, 설명 항목이 있어야 합니다.

      ### Error code
      http status 또는 response body의 오류 코드 정보입니다. 테이블로 작성해 주세요. 코드, 설명 항목이 있어야 합니다.

      ### Hooks(Callbacks)
      내부 로직에서 다른 시스템으로 hook 등의 이벤트를 발생시키는 경우, 해당 내용에 대해 작성해주세요.
      문서의 구조는 Request 항목과 동일한 내용으로 작성해 주세요.

      ## Flow
      mermaid를 이용하여 API의 내부 흐름을 상세하게 다이어그램으로 작성하고,
      텍스트로도 자세한 설명을 제공해 주세요.
      다이어그램과 텍스트에는 호출되는 함수명도 포함해서 작성하세요.
      flow chart, Sequence Diagram, Class Diagram을 모두 작성해야 합니다.

      ## 추가 정보
      명세를 이해하기 위해 더 필요한 부분이 있다면, 자유롭게 작성해 주세요.
    </FORMAT>
  `);

  await query(prompt);
  await updateDocLink(API_LIST_DOC, apiRow, filePath);

  logger.log(`API 문서 생성 완료: ${filePath}`);
}

async function analyze_workflow_list() {
  if (await isPathExists(WORKFLOW_LIST_DOC)) {
    const content = dedent(`
      # Workflow List
      ${WORKFLOW_LIST_TABLE_HEADER}
    `);
    await fs.writeFile(WORKFLOW_LIST_DOC, content, 'utf-8');
  }

  logger.log('Workflow 목록을 작성합니다.');

  const prompt = dedent(`
    지정된 파일들을 분석하여 연관되는 API들을 분석하고, 처리 흐름에 따라 workflow 목록을 작성해야 합니다.
    테이블의 헤더는 다음과 같습니다.
    ${WORKFLOW_LIST_TABLE_HEADER}

    * "API document path" column에는 "${API_LIST_DOC}"의 "Document Link" 항목을 기재해 주세요.

    # 분석할 파일 및 경로 패턴 목록 (목록 외의 다른 파일들은 절대 검색하지 마세요.)
    - ${API_LIST_DOC}
    - ${API_ROOT_PATH}/**/*.md

    수행해야 할 PseudoCode입니다.
    <PseudoCode>
      지정된 문서들을 분석합니다.
      workflow의 목록을 구성합니다.
      구성된 workflow마다:
        if ("${WORKFLOW_LIST_DOC}" 파일의 Workflow List 테이블에 해당 항목이 없다면):
          테이블에 항목 추가 ("document link" column에는 "@todo"로 작성);
    </PseudoCode>
  `);

  await query(prompt);
  logger.log('Workflow 목록 작성이 완료되었습니다.');
}

async function analyze_workflow() {
  const workflowListContents = await fs.readFile(WORKFLOW_LIST_DOC, { encoding: 'utf8'});
  const tables = searchMarkdownTables(workflowListContents);

  for (const table of tables) {
    const todoRows = table.rows.filter(row => row.match(/^.+@todo.*[|].*$/gm));

    if (todoRows !== null) {
      for (const todoRow of todoRows) {
        await analyze_workflow_item(table.header, todoRow);
      }
    }
  }
}

async function analyze_workflow_item(header, workflowRow) {
  const titles = header.split('|').map(item => item.trim());
  const context = [
    header,
    `|${'---|'.repeat(titles.length - 2)}`,
    workflowRow,
  ].join('\n');

  const descriptionIndex = titles.findIndex(title => {
    return title.toLowerCase() === 'label';
  });
  const description = workflowRow.split('|')[descriptionIndex].trim().replace(/\s+/g, '_');
  const filePath = `${WORKFLOW_ROOT_PATH}/${description}.md`;

  logger.log(`Workflow 문서 생성 시작: ${filePath}`);

  const prompt = dedent(`
    다음 Workflow에 대한 스펙 문서를 작성해야 합니다.
    (제공된 정보를 바탕으로 해당 Workflow를 구성하는 코드 전체를 분석하세요.)
    ${context}

    "${filePath}" 파일에 다음 내용을 작성해 주세요.
    (반드시 상세하게 작성하세요.)

    <FORMAT>
      # {타이틀: 워크플로우 이름}
      ## 개요
      워크플로우의 목적을 간략히 설명

      ## 상세 설명
      워크플로우에 대한 상세한 설명

      ## Flow
      mermaid를 이용하여 Workflow의 처리 흐름을 상세하게 다이어그램으로 작성하고, 
      텍스트로도 자세한 설명을 제공해 주세요.
      다이어그램과 텍스트에는 호출되는 API명도 포함해서 작성하세요.
      flow chart, Sequence Diagram을 모두 작성해야 합니다.

      ## 추가 정보
      명세를 이해하기 위해 더 필요한 부분이 있다면, 자유롭게 작성해 주세요.
    </FORMAT>
  `);
  await query(prompt);
  await updateDocLink(WORKFLOW_LIST_DOC, workflowRow, filePath);

  logger.log(`Workflow 문서 생성 완료: ${filePath}`);
}

async function summarize() {
  logger.log('최종 요약을 생성합니다.');

  const prompt = dedent(`
    지정된 파일들을 분석하여 전반적인 내용을 파악할 수 있는 명세서를 작성해야 합니다.
    작성되는 문서는 해당 프로젝트를 설명할 수 있는 "README"입니다.

    # 분석할 파일 및 경로 패턴 목록 (목록 외의 다른 파일들은 절대 검색하지 마세요.)
    - ${DOC_ROOT_PATH}/**/*.md
    
    "${README_DOC}" 파일에 다음 내용을 작성해 주세요.
    (반드시 상세하게 작성하세요.)

    <FORMAT>
      # 개요
      해당 프로젝트의 목적을 간략히 설명해 주세요.

      # 주요 기능
      제공되는 주요 기능들을 정리해 주세요.
      기능마다 sub title로 분리하여 작성해 주세요.

      # 개선 필요사항
      ## Security
      보안 취약점이 발견되는 경우, 해당 사항을 정리해 주세요.

      ## Code quality
      코드의 품질에 문제가 발견되는 경우, 해당 사항을 정리해 주세요.

      # 추가 정보
      명세를 이해하기 위해 더 필요한 부분이 있다면, 자유롭게 작성해 주세요.
    </FORMAT>
  `);
  await query(prompt);

  logger.log('최종 요약이 생성되었습니다.');
}

// util functions
async function query(prompt) {
  while (Infinity) {
    try {
      const systemPrompt = `
    # 규칙
    - 당신의 최우선 가치는 신중한 분석을 통해 정확한 결과를 작성하는 것입니다.
    - 당신에게는 시간 제약이 존재하지 않습니다.
        - *절대* 시간을 단축하려 하지 마세요.
        - *절대* 간단히 작성하려 하지 마세요.
        - *절대* 여러 항목을 병합하거나 병렬로 처리하지 마세요.
        - *절대* 프로세스를 최적화하여 진행하려 하지 마세요. (*반드시* 각 단계와 각각의 과정을 신중하게 하나씩 진행하세요.)
    - 당신이 작성해야 할 내용들은 주요(핵심) 사양이 아닌 전체 항목에 대한 명세서입니다.
    - 문서는 "markdown format"으로 한국어로 작성하며, 다이어그램의 표현은 mermaid 코드 블럭으로 작성해 주세요. (syntax error에 주의하세요.)
    - *절대* python 등의 언어를 포함한 스크립트를 작성하여 실행하지 마세요.
  `;
      const shell = [
        'claude',
        '-p',
        '--permission-mode bypassPermissions',
        '--input-format text',
        '--output-format text', // json
        `--append-system-prompt "$(cat <<'SYSTEM_PROMPT'\n${systemPrompt}\nSYSTEM_PROMPT\n)"`,
        `"$(cat <<'QUERY_PROMPT'\n${prompt}\nQUERY_PROMPT\n)"`,
      ];

      const result = execSync(shell.join(' '), {encoding: 'utf8'});
      logger.log(result);

      return result;
    } catch (e) {
      if (e?.status === 1 && e?.stdout?.search('usage limit') !== -1) {
        logger.log(`사용량 제한이 감지되었습니다.`);

        const searchTimestamp = e.stdout.match(/[|](\d+)/);
        if (searchTimestamp !== null) {
          const timestamp = parseInt(searchTimestamp[1], 10) * 1000;
          const delayTimestamp = timestamp - Date.now();

          logger.log(`${new Date(timestamp).toLocaleString()}에 할당량 제한이 초기화되므로 ${delayTimestamp}ms 만큼 대기합니다.`);
          await delay(delayTimestamp);
        } else {
          const delayTimestamp = 600 * 1000; // 10 minutes
          logger.log(`할당량 초기화 시간이 감지되지 않아 ${delayTimestamp}ms 만큼 대기합니다.`);
          await delay(delayTimestamp);
        }
      } else {
        // throw e;
        const delayTimestamp = 100; // 10 minutes

        logger.error(`오류가 발생하였습니다. ${delayTimestamp}ms 후 재시도합니다.`);
        logger.error(e);
        await delay(delayTimestamp);
      }
    }
  }
}

async function mkdir(path) {
  if (!await isPathExists(path)) {
    await fs.mkdir(path, { recursive: true });
  }

  return true;
}

async function isPathExists(path) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function getRelativePath(path) {
  const prefix = `${DOC_ROOT_PATH}/`;
  return path.startsWith(prefix)
      ? path.slice(prefix.length)
      : path;
}

function dedent(text, isTrim = true) {
  const matched = text.replace(/[\r\n]+/g, '').match(/^\s*/);

  if (matched === '') return text;

  const re = new RegExp(`^${matched}`, 'gm');
  const result = text.replace(re, '');

  return isTrim ? result.replace(/(^[\r\n\s]+)|([\r\n\s]+$)/g, '') : result;
}

function delay(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

function searchMarkdownTables(content) {
  const tables = [];
  let table = null;

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (table === null) {
        table = {
          header: trimmed,
          rows: [],
        }
      } else {
        if (trimmed.match(/^[|-]+$/) === null) {
          table.rows.push(trimmed);
        }
      }
    } else {
      if (table !== null) {
        tables.push(table);
        table = null;
      }
    }
  });

  if (table !== null) {
    tables.push(table);
    table = null;
  }

  return tables;
}

async function updateDocLink(docPath, lineContent, targetPath) {
  const before = await fs.readFile(docPath, { encoding: 'utf8'});
  const afterRows = before.split('\n').map((line) => {
    if (line === lineContent) {
      return line.replace(
        '@todo',
        `[${targetPath.replace(/^.*\//, '')}](${getRelativePath(targetPath)})`
      );
    } else {
      return line;
    }
  });

  await fs.writeFile(docPath, afterRows.join('\n'), 'utf-8');
}



function getLogTime() {
  return `[${getNow()}]`;
}

function getLogPayload(message) {
  return typeof message === 'string'
      ? message
      : inspect(message, {showHidden: false, depth: null, colors: true});
}

function getNow() {
  return new Date().toISOString();
}
