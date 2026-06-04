# About

This is a simple tool to enable programming of simple esp32 projects using a flowchart.

This was created largely through the use of AI.  If development continues it will be tailored for use with some small form factor robotic cart.  The tool is meant to be useful in gaining/training basic programming skills.

At some point a may attempt a clean rewrite sans AI and with a more sensible code layout (instead of a single massive html/js/css file).

## Current things that need fixing
1) variable and data nodes should be much smaller, should probably be about half the current width.
2) operators should allow you to edit a an b in the edit context window (the way read does).  Editing this should update the operators title
3) functions that are read from lib should also have seperate output nodes
4) functions should prepend the defualt outputs with __ so to help avoid varible name collisions in the future

## Future work
1) make variable dropdowns on read blocks
2) make loops more intuitive
3) introduce lists?
