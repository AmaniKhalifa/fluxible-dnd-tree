# README #

### What is this repository for? ###

* Drag and Drop Tree using [React dnd library](http://react-dnd.github.io/)

### How do I get set up? ###

* run npm install
* Usage examples are in storybook.
* Running storybook using : `npm run storybook`
* In your browser, go to http://localhost:9001/


### How to build release ###
npm run dist


## Generate example data with stories/gen.js ##
Run in the project directory:
node stories/gen.js | pbcopy

Configure amount of generated data in gen.js source-code.



# ISSUES #
1. Manage hover, dragged, collapsed, selected, ...-classes outside from the library
=> manage collapsed, selected states outside of the library (this means they should not be part of the core-actions)
2. Actions shall have a standard format like: { type:String, data:ImmutableMap }
3. Update this readme to following this structure: Usage, Base technology (What is the core technology we use), Justification of Project
4. Decide in DevMeeting for way to track these issues.
