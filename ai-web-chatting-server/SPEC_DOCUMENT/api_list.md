# API List

| Method | Endpoint | Description | Module | File Location | Document Link |
|--------|----------|-------------|---------|---------------|---------------|
| GET | / | Home page | index | routes/index.js:5-7 | [Home_page.md](API_SPEC/Home_page.md) |
| POST | /users/signup | User registration | users | routes/users.js:9-43 | [User_registration.md](API_SPEC/User_registration.md) |
| POST | /users/login | User login | users | routes/users.js:45-100 | [User_login.md](API_SPEC/User_login.md) |
| POST | /users/refresh | Refresh access token | users | routes/users.js:103-149 | [Refresh_access_token.md](API_SPEC/Refresh_access_token.md) |
| GET | /users/me | Get current user info | users | routes/users.js:152-177 | [Get_current_user_info.md](API_SPEC/Get_current_user_info.md) |
| POST | /users/logout | User logout | users | routes/users.js:180-200 | [User_logout.md](API_SPEC/User_logout.md) |
| PUT | /users/profile | Update user profile | users | routes/users.js:203-232 | [Update_user_profile.md](API_SPEC/Update_user_profile.md) |
| DELETE | /users/account | Delete user account | users | routes/users.js:235-260 | [Delete_user_account.md](API_SPEC/Delete_user_account.md) |
| POST | /ai/chat | Multi-turn Gemini chat | ai | routes/ai.js:7-22 | [Multi-turn_Gemini_chat.md](API_SPEC/Multi-turn_Gemini_chat.md) |
| POST | /ai/chat/tool | Chat with function calling | ai | routes/ai.js:25-39 | [Chat_with_function_calling.md](API_SPEC/Chat_with_function_calling.md) |
| POST | /ai/chat/rag | Chat with RAG | ai | routes/ai.js:42-56 | [Chat_with_RAG.md](API_SPEC/Chat_with_RAG.md) |
| POST | /vector/store-message | Store message in vector DB | vector | routes/vector.js:12-49 | [Store_message_in_vector_DB.md](API_SPEC/Store_message_in_vector_DB.md) |
| POST | /vector/search-similar | Search similar messages | vector | routes/vector.js:55-91 | [Search_similar_messages.md](API_SPEC/Search_similar_messages.md) |
| POST | /vector/search-knowledge | Search knowledge base | vector | routes/vector.js:97-132 | [Search_knowledge_base.md](API_SPEC/Search_knowledge_base.md) |
| GET | /vector/collection-info | Get collection info | vector | routes/vector.js:138-153 | [Get_collection_info.md](API_SPEC/Get_collection_info.md) |
| POST | /vector/test-embedding | Test embedding generation | vector | routes/vector.js:159-194 | [Test_embedding_generation.md](API_SPEC/Test_embedding_generation.md) |
| POST | /room | Create chat room | room | routes/room.js:8-24 | [Create_chat_room.md](API_SPEC/Create_chat_room.md) |
| GET | /room | Get chat rooms | room | routes/room.js:26-39 | [Get_chat_rooms.md](API_SPEC/Get_chat_rooms.md) |
| POST | /rag/knowledge/document | Create knowledge document | rag | routes/rag.js:9-34 | [Create_knowledge_document.md](API_SPEC/Create_knowledge_document.md) |
| POST | /rag/knowledge/document/file | Create knowledge from file | rag | routes/rag.js:37-100 | [Create_knowledge_from_file.md](API_SPEC/Create_knowledge_from_file.md) |
| GET | /protected-example/protected | Protected resource access | protected-example | routes/protected-example.js:19-29 | [Protected_resource_access.md](API_SPEC/Protected_resource_access.md) |
| GET | /protected-example/admin | Admin only resource | protected-example | routes/protected-example.js:32-42 | [Admin_only_resource.md](API_SPEC/Admin_only_resource.md) |
| GET | /protected-example/api/data | Protected API data | protected-example | routes/protected-example.js:47-58 | [Protected_API_data.md](API_SPEC/Protected_API_data.md) |