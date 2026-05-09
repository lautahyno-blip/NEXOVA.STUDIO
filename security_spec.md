# Security Specification - NEXOVA STUDIO

## Data Invariants
1. A portfolio item must have a title, category, and imageUrl.
2. Only an authenticated admin can create, update, or delete portfolio items and services.
3. Anyone can read portfolio items and services.
4. Anyone can send a message (create in `messages`), but only an admin can read or delete them.
5. Clients cannot update existing messages.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a portfolio item as a non-admin.
2. **Resource Poisoning**: Create a portfolio item with a 1MB string in the title.
3. **State Shortcutting**: Try to update the `createdAt` of a portfolio item to bypass immutability.
4. **PII Leak**: Non-admin attempting to list the `messages` collection.
5. **Unauthorized Modification**: Non-admin attempting to change the description of a service.
6. **Shadow Field**: Adding `isPromoted: true` to a portfolio item update if not in schema.
7. **Orphaned Record**: Creating a message with an invalid email format.
8. **Bulk Deletion**: Non-admin attempting to delete all entries in `portfolio`.
9. **Spam Injection**: Creating 1000 messages in 1 second (Rate limiting handled by Firebase usually, but we check path vars).
10. **ID Hijacking**: Creating a message with a custom malicious ID.
11. **Type Poisoning**: Sending a boolean where a string is expected in `Service`.
12. **Admin Privilege Escalation**: A user trying to add themselves to the `admins` collection.

## Access Control Matrix
| Collection | Create | Read (Get/List) | Update | Delete |
|------------|--------|-----------------|--------|--------|
| portfolio  | Admin  | Public          | Admin  | Admin  |
| services   | Admin  | Public          | Admin  | Admin  |
| messages   | Public | Admin           | None   | Admin  |
| admins     | None   | Admin           | None   | None   |

*(Admin status verified via lookup in /admins/{userId})*
