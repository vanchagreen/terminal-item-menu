# terminal-item-menu
A simple, searchable menu for the terminal

Here's an example:


```javascript
var Menu = require('terminal-item-menu');

var pokeMenu = new Menu({
  header: 'Choose a Pokemon',
  items: [
	  {
	  	value: 'bulbasaur',
	  	text: '#01 Bulbasaur'
	  },
	  {
	  	value: 'charmander',
	  	text: '#04 Charmander'
	  },
	  {
	  	value: 'squirtle',
	  	text: '#07 Squirtle'
	  },
	  {
	  	value: 'pikachu',
	  	text: '#025 Pikachu'
	  }
  ]
});

pokeMenu.start().then(val => console.log('You chose ' + val));
```

Insert gif here

##Docs

####Menu Options

Option | Type | Default | Description | Required
--- |--- | --- |--- | ---
caseInsensitive | boolean | false | If true, the `ctrl+r` search mode is case insensitive | 
header | string | *null* | A header for the menu | 
items | array of **MenuItem** | N/A | The list of menu items | ✓
onExit | function | *null* | A function that gets called when the menu closes (when an item is selected, or the menu is quit) | 
onQuit | function | *null* | A function that gets called when the user quits the menu with `control+c` | 
startIndex | number | 0 | The index within the item list of the initially displayed item | 

####MenuItem

Property | Type | Default | Description | Required
--- |--- | --- |--- | ---
onSelect | function | *null* | A function that gets called when the item is selected | 
text | string | **MenuItem**.value | The text to be displayed for the item |
value | function | *null* | The value that gets reported when the item is selected. Is the default displayed text, if the text option is null.  | ✓

####Menu Instance Properties

Property | Type | Description
--- |--- | ---
start | function | Call this function to display the menu on the screen. It will return a promise that will `resolve` with the selected item value, or `reject` if the user quits the menu. 



#### How to Use the Menu

Key | Effect 
--- |--- 
Up/Down | Moves up and down the item list
Ctrl+c | Closes the menu or exits out of search mode
Ctrl+r / Ctrl+s | Enters search mode. When the user types characters, it will search against the menu items' text field, and display the relevant ones. Hitting `Ctrl+r/Ctrl+s` again, will cycle between relevant results. `Ctrl+c` will exit search mode, `Enter` will exit search mode with the current search item selected.
Enter | Selects the current item. In search mode it sets the current search item as the current item and exits search mode.


 