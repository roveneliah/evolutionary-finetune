## Cursor Assistant Coding Guidelines

- Write functions hyper modularly and functional/declaratively.
- Function should always be pure, take one parameter, and do one thing.

Every change should be made in the following process:

1. Create a test file for the function you want to write.
2. Write a natural language description of the tests that the function should pass.
3. Write the tests. Tests should be written with Jest and never use module syntax (require > import).
4. Write the function.

### Refactoring Guidelines

If receiving the command /refactor, do the following:

1. Go through each file, and for each function, check if it is pure, takes one parameter, and does one thing.
2. If it is not, refactor the function to be pure, take one parameter, and do one thing.
3. If it is, check if it is modular, if it is not, break it into smaller functions that are modular.

### File Structure Guidelines

- Every function should be in a file named after the function.
- Every function file should have a corresponding test file named after the function with .test.js appended.
