# test-crud-skill

A skill implementing the crud pattern

## Purpose
Implements standard CRUD (Create, Read, Update, Delete) operations for data management.

## Capabilities
- Create new records/entities
- Read/Retrieve existing records
- Update existing records
- Delete records
- List all records with optional filtering

## Parameters
- operation (create|read|update|delete): The CRUD operation to perform
- data (object): Data for create/update operations
- id (string): Identifier for read/update/delete operations
- filters (object): Optional filters for list operations

## Dependencies
- Database connection
- Authentication (if required)

## Implementation
See implementation file for details

## Notes
- Follows RESTful API principles
- Implements proper error handling
- Includes validation for all inputs
