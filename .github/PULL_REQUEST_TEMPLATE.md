name: Pull Request
description: Submit a pull request
body:
  - type: markdown
    attributes:
      value: |
        Thank you for contributing to Stigmergy CLI! Please fill out this form.
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What does this PR do?
      placeholder: |
        - Fixes #(issue number)
        - Adds feature X
        - Updates documentation for Y
    validations:
      required: true
  - type: checkboxes
    id: checklist
    attributes:
      label: Pre-submission Checklist
      options:
        - label: I have run `npm run lint` and all checks pass
          required: true
        - label: I have added tests for new functionality
          required: false
        - label: I have updated documentation if needed
          required: false
        - label: I have linked the related issue(s)
          required: false
