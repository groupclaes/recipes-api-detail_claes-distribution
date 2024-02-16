# Claes Distribution Recipes Detail API Controller

## Endpoints
`GET /api/{version}/recipes/detail/:id`  
retrieve details of recipe with :id in ?culture
Query parameters {type} name [default value]:
- {string} culture ['nl']
- {number} shop_id [null]

`GET /api/{version}/recipes/detail/:id/qr-code.png`
retrieve a png qr-code image with a link to the recipe with :id in ?culture
Query parameters {type} name [default value]:
- {string} culture ['nl']