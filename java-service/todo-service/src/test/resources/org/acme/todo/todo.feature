Feature: Manage To-Do items
  As a user of the API
  I want to be able to manage my to-do items

  Scenario: Retrieve all to-do items
    Given the to-do service has a list of items
    When a user requests all to-do items
    Then the response status should be 200
    And the response should contain 2 to-do items
    And the first item should have the title "Buy groceries" and be incomplete
    And the second item should have the title "Walk the dog" and be complete

  Scenario: Retrieve a single to-do item by ID
    Given a to-do item with ID "1" exists
    When a user requests the to-do item with ID "1"
    Then the response status should be 200
    And the response should be the to-do item with title "Buy groceries"

  Scenario: To-do item is not found
    Given no to-do item with ID "99" exists
    When a user requests the to-do item with ID "99"
    Then the response status should be 404

  Scenario: Create a new to-do item
    When a user creates a new to-do item with title "Finish the report"
    Then the response status should be 201
    And the response should contain the newly created to-do item with title "Finish the report"