var Menu = require('./index');

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