# CampusLoop Backend – Prototype 1

A Spring Boot REST API for the first CampusLoop MVP slice: creating, browsing, searching, updating, reserving, marking sold, and deleting product listings.

## Requirements
- Java 17+
- Maven 3.9+
- MySQL 8+

## Run locally
1. Create a MySQL database (or let the URL create it): `campusloop`.
2. Set database credentials using environment variables if needed:
   - `DB_URL` (optional; default is localhost:3306/campusloop)
   - `DB_USERNAME` (default: root)
   - `DB_PASSWORD` (default: blank)
3. From this folder, run: `mvn spring-boot:run`
4. API base URL: `http://localhost:8080/api/products`

Do not deploy with the default credentials, wildcard CORS, or unauthenticated endpoints. Authentication/authorisation and ownership checks are not included in this first prototype slice.

## API examples

Create listing – `POST /api/products`
```json
{
  "title": "Engineering Mathematics – Vol 1",
  "description": "Good condition, no missing pages.",
  "price": 250.00,
  "category": "BOOKS",
  "condition": "GOOD",
  "sellerName": "Aarav",
  "sellerEmail": "aarav@jguni.in",
  "meetingPoint": "JG University Main Gate",
  "imageUrl": "https://example.com/book.jpg"
}
```

Other endpoints:
- `GET /api/products` – list available products
- `GET /api/products/1` – get one product
- `GET /api/products/search?keyword=math` – search by title
- `GET /api/products/category/BOOKS` – filter by category
- `PUT /api/products/1` – update listing (send same JSON shape)
- `PATCH /api/products/1/status?status=RESERVED` – reserve listing
- `PATCH /api/products/1/status?status=SOLD` – mark sold
- `DELETE /api/products/1` – delete listing

Allowed categories: `BOOKS`, `CLOTHING`, `ELECTRONICS`, `HOSTEL_ESSENTIALS`, `SPORTS`, `OTHER`.
Allowed conditions: `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`.
Allowed statuses: `AVAILABLE`, `RESERVED`, `SOLD`.

## Assignment concepts demonstrated
- OOP: Product entity, service and controller classes.
- Interface: ProductRepository extends Spring Data's JpaRepository.
- Custom exceptions: ProductNotFoundException and InvalidProductException.
- Multithreading: @Async background listing notification log.
- Database persistence: Spring Data JPA + MySQL.

File management/export and authentication are planned for the next development iteration. The async notification is currently a log message, not a real email.
