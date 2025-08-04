# Workflow List

## 개요
이 문서는 AI 웹 채팅 서버에서 제공하는 API들을 업무 흐름에 따라 그룹화한 워크플로우 목록입니다. 각 워크플로우는 특정 비즈니스 프로세스를 완성하기 위해 연관된 API들을 순차적 또는 병렬적으로 호출하는 패턴을 나타냅니다.

## Workflow List

| Label | Description | API document path | Document Link |
|-------|-------------|-------------------|---------------|
| 사용자 인증 및 계정 관리 | 사용자 회원가입, 로그인, 토큰 갱신, 로그아웃, 프로필 관리, 계정 삭제까지의 전체 사용자 생명주기 관리 | API_SPEC/User_registration.md, API_SPEC/User_login.md, API_SPEC/Refresh_access_token.md, API_SPEC/User_logout.md, API_SPEC/Get_current_user_info.md, API_SPEC/Update_user_profile.md, API_SPEC/Delete_user_account.md | [사용자_인증_및_계정_관리.md](WORKFLOW_SPEC/사용자_인증_및_계정_관리.md) |
| AI 채팅 대화 관리 | Gemini AI를 활용한 다중 턴 대화, 도구 함수 호출, RAG 기반 대화 처리 | API_SPEC/Multi-turn_Gemini_chat.md, API_SPEC/Chat_with_function_calling.md, API_SPEC/Chat_with_RAG.md | [AI_채팅_대화_관리.md](WORKFLOW_SPEC/AI_채팅_대화_관리.md) |
| 채팅방 관리 | 채팅방 생성, 조회 및 관리 기능 | API_SPEC/Create_chat_room.md, API_SPEC/Get_chat_rooms.md | [채팅방_관리.md](WORKFLOW_SPEC/채팅방_관리.md) |
| 벡터 기반 의미 검색 | 메시지의 벡터 저장, 유사도 검색, 지식베이스 검색, 임베딩 테스트 등 벡터 데이터베이스 활용 | API_SPEC/Store_message_in_vector_DB.md, API_SPEC/Search_similar_messages.md, API_SPEC/Search_knowledge_base.md, API_SPEC/Get_collection_info.md, API_SPEC/Test_embedding_generation.md | [벡터_기반_의미_검색.md](WORKFLOW_SPEC/벡터_기반_의미_검색.md) |
| RAG 지식 관리 | 문서 기반 지식베이스 구축 및 관리 | API_SPEC/Create_knowledge_document.md, API_SPEC/Create_knowledge_from_file.md | [RAG_지식_관리.md](WORKFLOW_SPEC/RAG_지식_관리.md) |
| 권한 기반 리소스 접근 | 인증 및 역할 기반 보호된 리소스 접근 | API_SPEC/Protected_resource_access.md, API_SPEC/Admin_only_resource.md, API_SPEC/Protected_API_data.md | [권한_기반_리소스_접근.md](WORKFLOW_SPEC/권한_기반_리소스_접근.md) |
| 시스템 정보 조회 | 기본 홈페이지 및 시스템 상태 조회 | API_SPEC/Home_page.md | [시스템_정보_조회.md](WORKFLOW_SPEC/시스템_정보_조회.md) |