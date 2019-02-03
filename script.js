const $ = (selector) => document.querySelector(selector);

function delegate(parent, selector, type, handler) {
  function delegatedFunction(event) {
    let target = event.target;
    if (target.matches(`${parent} ${selector}, ${parent} ${selector} *`)) {
      while (!target.matches(selector)) {
        target = target.parentNode;
      }
      handler.call(target, event);
    }
  }

  $(parent).addEventListener(type, delegatedFunction);
}

const colors = ['red', 'green', 'yellow', 'blue'];

let table, difficulty, selectedField, size, unfilled, timer;

function generateTable(){
    clearTable();
    fillTable();
    renderTable();
    generateSelection();
}

function generateSelection(){
	let html = "";
	for(let i = 0;i<size; ++i){
		html+=`<li class="${colors[i]}"></li>`;
	}
	$('#colors').innerHTML = html;
}

function clearTable(){
	table=[];
	for(let i=0; i<size; ++i){
		table.push([]);
		for(let j=0; j<size; ++j){
			table[i].push({
				color: 'white',
				fixed: false
			});
		}
	}
}

function fillTable(){
	console.log('----------Backtracking debug----------');
	fillField(table[0][0],0,0);
	console.log('----------Backtracking debug----------');
	if(size === 3){
		if(difficulty == 'easy'){
			generateEmptyFields(1);
			unfilled = 1;
		}else{
			generateEmptyFields(3);
			unfilled = 3;
		}
	}else{
		if(difficulty == 'easy'){
			generateEmptyFields(3);
			unfilled = 3;
		}else{
			generateEmptyFields(5);
			unfilled = 5;
		}
	}
}

function generateEmptyFields(n){
	for(let k = 0; k<n; ++k){
		let i, j;
		do{
			i = Math.floor(Math.random()*size);
			j = Math.floor(Math.random()*size);
		}while(table[i][j].color == 'white');
		table[i][j].color = 'white';
		table[i][j].fixed = false;
	}
}

function fillField(field,i,j){
	let availableColors = genAvailableColors(field,i,j);
	shuffle(availableColors);
	console.log(availableColors);
	let good = false;
	for(let k = 0; k<availableColors.length; ++k){
		console.log(i,j,availableColors[k]);
		field.color = availableColors[k];
		field.fixed = true;
		if(j<size-1){
			good = fillField(table[i][j+1], i, j+1);
		}else if(j==size-1 && i<size-1){
			good = fillField(table[i+1][0], i+1, 0);
		}else if(j==size-1 && i==size-1) return true;
		if(good){
			return good;
		}
	}
	console.log(i,j,'----Backtrack----');
	return false; 
}

function shuffle(array){
	for(let i=0; i<array.length*5;++i){
		const k = Math.floor(Math.random()*array.length);
		const j = Math.floor(Math.random()*array.length);
		const tmp = array[j];
		array[j] = array[k];
		array[k] = tmp;
	}
}

function genAvailableColors(field,i,j){
	let availableColors = genAvailableColorsInRowCol(i,j);
	let availableColorsInSquare;
	if(size === 4){
		let square;
		if(i<2){
			if(j<2){
				square = 0;
			}else{
				square = 1;
			}
		}else{
			if(j<2){
				square = 2;
			}else{
				square = 3;
			}
		}
		availableColorsInSquare = genAvailableColorsInSquare(square);	
	}
	if(size === 4){
		availableColors = intersect(availableColors, availableColorsInSquare);
	}
	return availableColors;
}

function genAvailableColorsInRowCol(row, col){
	let availableColors = sizeColors(size);
	for(let i=0; i<size; ++i){
		if(availableColors.indexOf(table[row][i].color) !== -1){
			let index = availableColors.indexOf(table[row][i].color);
			availableColors.splice(index,1);
		}
		if(availableColors.indexOf(table[i][col].color) !== -1){
			let index = availableColors.indexOf(table[i][col].color);
			availableColors.splice(index,1);
		}
	}
	return availableColors;
}

function sizeColors(size){
	let result = [];
	for(let i =0; i<size; ++i){
		result.push(colors[i]);
	}
	return result;
}

function genAvailableColorsInSquare(square){
	let i,j,endI, endJ;
	let availableColors = sizeColors(4);
	if(square == 0){
		i = 0;
		j = 0;
		endI = 2;
		endJ = 2;
	} else if(square == 1){
		i = 0;
		j = 2;
		endI = 2;
		endJ = 4;
	} else if(square == 2){
		i = 2;
		j = 0;
		endI = 4;
		endJ = 2;
	} else {
		i = 2;
		j = 2;
		endI = 4;
		endJ = 4;
	}
	let initJ = j;
	while(i<endI){
		while(j<endJ){
			if(availableColors.indexOf(table[i][j].color) !== -1){
				let index = availableColors.indexOf(table[i][j].color);
				availableColors.splice(index,1);
			}
			++j;
		}
		++i;
		j=initJ;
	}
	return availableColors;
}

function intersect(a,b){
	if(a.length > b.length){
		return intersect(b,a);
	}
	result = [];
	for(let i = 0; i<a.length; ++i){
		if(b.indexOf(a[i])!==-1){
			result.push(a[i]);
		}
	}
	return result;
}

function renderTable(){
	let html = "";
	for(let i =0; i<size; ++i){
		html+="<tr>";
		for(let j=0; j<size; ++j){
			html += `<td class=
			"
			${table[i][j].color} 
			${size==4 && (i==0 || i==2)?"square-border-top":""} 
			${size==4 && (j==0 || j==2)?"square-border-left":""}  
			${size==4 && (i==1 || i==3)?"square-border-bottom":""} 
			${size==4 && (j==3 || j==1)?"square-border-right":""}
			"
			data-i="${i}" data-j="${j}"></td>`
		}
		html+="</tr>"
	}
	$('table').innerHTML = html;
}

delegate('table', 'td', 'pointerdown', function(e){
	selectedField = this;
	if($('td.selected')) $('td.selected').classList.remove('selected');
	let i = selectedField.getAttribute('data-i');
	let j = selectedField.getAttribute('data-j');
	if(this.classList[0] !== 'white' && table[i][j].fixed){
		$('#selection').classList.remove('active');
		return;
	}
	if(!this.classList.contains('white')) unfilled++;
	table[i][j].color = 'white';
	selectedField.classList.remove('blue');
	selectedField.classList.remove('red');
	selectedField.classList.remove('green');
	selectedField.classList.remove('yellow');
	selectedField.classList.remove('editable');
	selectedField.classList.add('white')
	$('#selection').classList.add('active');
	selectedField.classList.add('selected');
});

delegate('#selection', 'li', 'pointerdown', function(e){
	let i = selectedField.getAttribute("data-i");
	let j = selectedField.getAttribute("data-j");
	if(!validStep(i,j,this.classList[0])){
		addAnimation(this, "wobble");
		removeAnimation(this, "wobble");
		return;
	}
	table[i][j].color = this.classList[0];
	
	$('#selection').classList.remove('active');
	let topColor = this.getBoundingClientRect().top+"px";
	let leftColor = this.getBoundingClientRect().left+"px";
	this.style.position = "absolute";
	this.style.top = topColor;
	this.style.left = leftColor;
	this.style.transition = "all 2s ease 0s;"

	let width = getComputedStyle($('td')).width;
	let top = selectedField.getBoundingClientRect().top+2;
	let left = selectedField.getBoundingClientRect().left-2;
	animate(this,selectedField,this.classList[0],top,left,width);
	selectedField.classList.remove('selected');
	selectedField = undefined;
	unfilled--;
	if(unfilled == 0) gameWon();
});

function gameWon(){
	$('.newgame').classList.remove('hidden');
	setTimeout(function(){	
		generateTimer();
		timer = setInterval(function(){
			let time = parseInt($('.timernum').innerHTML);
			$('.timernum').innerHTML = parseInt($('.timernum').innerHTML)-1;
			$('.timer').style.width = (time-2)*100/15 + '%';
			if(parseInt($('.timernum').innerHTML) == 9){
				$('.cont').style.width = '125px';
			}
			if(parseInt($('.timernum').innerHTML) == 0){
				$('.timer').style.width = 0;
				clearInterval(timer);
				removeTimer();
				setTimeout(()=>{
					addAnimation($('.newgame'), "zoomOut");
					$('.newgame').style.animationDelay = '0s';
					removeAnimationNow($('table'), "flipInX");
					addAnimation($('table'), "flipOutX");
					addAnimation($('#door'), 'bounceOut');
					setTimeout(function(){
						$('h1').classList.remove('hidden');
						addAnimation($('h1'), "zoomIn");
						removeAnimationNow($('#start'), 'bounceOutUp');
						addAnimation($('#start'), 'bounceInUp');
					},1000);
				},1000);
			}
		},1000);
	},4000);
}

function removeAnimation(element, animation){
	setTimeout(function(){
		element.classList.remove(animation);
		element.classList.remove("animated");
	},1000)
}

function addAnimation(element, animation){
	element.classList.add('animated');
	element.classList.add(animation);
}

function removeAnimationNow(element, animation){
	element.classList.remove(animation);
	element.classList.remove("animated");
}

function validStep(i,j,color){
	 return (genAvailableColors(table[i][j],i,j).indexOf(color))!==-1;
}

function animate(a,b,color,top, left, width){
	setTimeout(function(){
		a.style.top = top + 'px';
		a.style.left = left+'px';
		a.style.width = width;
		a.style.height = width;
		a.style.opacity = 1;
		setTimeout(function(){
			a.style = "";
			b.classList.remove('white');
			b.classList.add(color);
			b.classList.add('editable');
		},2000)
	},1);
}

$('#start').addEventListener('pointerdown', function(){
	removeAnimationNow(this, "bounceInUp");
	addAnimation(this, "bounceOutUp");
	addAnimation($('h1'), "zoomOut");
	//removeAnimation(this, "bounceOutUp");
	
	setTimeout(()=>{
		removeAnimationNow($('.buttons.size'), "fadeOut");
		$('.buttons.size').classList.remove('hidden');
		addAnimation($('.buttons.size'), "fadeIn");
		
	},200);
	animateButtons($('#small'),$('#large'));
	setTimeout(()=>{
		animatePicsIn();
	},1000);
});

$('h1').addEventListener("animationend",function(e){
	removeAnimationNow(this, e.animationName);
	if(e.animationName == "zoomOut"){
		this.classList.add('hidden');
	}
});

function animatePicsIn(){
	let kicsi = $('#kicsi');
	let nagy = $('#nagy');
	removeAnimationNow(kicsi, "fadeOut");
	removeAnimationNow(nagy, "fadeOut");
	kicsi.classList.remove('hidden');
	nagy.classList.remove('hidden');
	addAnimation(kicsi, "fadeIn");
	addAnimation(nagy, "fadeIn");
}

function animatePicsOut(){
	let kicsi = $('#kicsi');
	let nagy = $('#nagy');
	removeAnimationNow(kicsi, "fadeIn");
	removeAnimationNow(nagy, "fadeIn");
	addAnimation(kicsi, "fadeOut");
	addAnimation(nagy, "fadeOut");
	setTimeout(()=>{
		kicsi.classList.add('hidden');
		nagy.classList.add('hidden');
	},1000);
}

function animateButtons(a,b){
	setTimeout(function(){
		a.classList.remove('hidden');
		removeAnimationNow(a, 'bounceOutUp');
		addAnimation(a, "bounceInUp");
		setTimeout(function(){
			b.classList.remove('hidden');
			removeAnimationNow(b, 'bounceOutDown');
			addAnimation(b, "bounceInDown");
		},200);
	}, 500);
}

delegate('.buttons.size', '#small', 'pointerdown', function(){
	animateSizeButtons();
	animatePicsOut();
	size = 3;
});

delegate('.buttons.size', '#large', 'pointerdown', function(){
	animateSizeButtons();
	animatePicsOut();
	size = 4;
});

function animateSizeButtons(){
	removeAnimationNow($('#small'), "bounceInUp");
	removeAnimationNow($('#large'), "bounceInDown");
	addAnimation($('#small'), "bounceOutUp");
	removeAnimationNow($('.buttons.difficulty'), "fadeOut");
	addAnimation($('.buttons.size'), "fadeOut");
	setTimeout(function(){
		addAnimation($('#large'), "bounceOutDown");
		animateButtons($('#easy'),$('#hard'));
	}, 200);
	setTimeout(()=>{
		$('.buttons.difficulty').classList.remove('hidden');
		addAnimation($('.buttons.difficulty'), "fadeIn");
		
	},400);
		
	setTimeout(function(){
		
		$('#small').classList.add('hidden');
		$('#large').classList.add('hidden');
		$('.buttons.size').classList.add('hidden');
	},1000);
}

delegate('.buttons.difficulty', '#easy', 'pointerdown', function(){
	animateDifficultyButtons();
	difficulty = 'easy';
	renderGame();
});

delegate('.buttons.difficulty', '#hard', 'pointerdown', function(){
	animateDifficultyButtons();
	difficulty = 'hard';
	renderGame();
});

function animateDifficultyButtons(){
	removeAnimationNow($('#easy'), "bounceInUp");
	removeAnimationNow($('#hard'), "bounceInDown");
	addAnimation($('#easy'), "bounceOutUp");
	addAnimation($('.buttons.difficulty'), "fadeOut");
	setTimeout(function(){
		addAnimation($('#hard'), "bounceOutDown");
	}, 200);
	setTimeout(function(){
		$('#easy').classList.add('hidden');
		$('#hard').classList.add('hidden');
		$('.buttons.difficulty').classList.add('hidden');
	},1000);
}

function renderGame(){
	generateTable();
	setTimeout(function(){
		$('table').classList.remove('hidden');
		addAnimation($('table'), "flipInX");
		setTimeout(function(){
			$('#door').classList.remove('hidden');
			removeAnimationNow($('#door'), "bounceOut");
			addAnimation($('#door'), "bounceIn");
		},200);
	},500);
}

$('#door').addEventListener('pointerdown', function(){
	$('.confirmation').classList.remove('hidden');
	addAnimation($('.confirmation'), "fadeIn");
	addAnimation(this, 'bounceOut');
});

$('.confirmation').addEventListener('animationend', function(e){
	removeAnimationNow(this, e.animationName);
	if(e.animationName == 'fadeOut'){
		this.classList.add('hidden');
	}
	if(e.animationName == 'zoomOut'){
		this.classList.add('hidden');		
	}
})

$('table').addEventListener('animationend', function(e){
	if(e.animationName == "flipOutX"){
		this.classList.add('hidden');
		removeAnimationNow(this,'flipOutX');
		//removeAnimationNow($('#start'), 'bounceOutUp');
		//addAnimation($('#start'), 'bounceInUp');
	}
});

$('#yes').addEventListener('pointerdown', function(){
	addAnimation($('.confirmation'), "zoomOut");
	$('#selection').classList.remove('active');
	removeAnimationNow($('table'), "flipInX");
	addAnimation($('table'), "flipOutX");
	setTimeout(function(){
		$('h1').classList.remove('hidden');
		addAnimation($('h1'), "zoomIn");
		removeAnimationNow($('#start'), 'bounceOutUp');
		addAnimation($('#start'), 'bounceInUp');
	},1000);
	
});

$('#no').addEventListener('pointerdown', function(){
	addAnimation($('.confirmation'), "fadeOut");
	removeAnimationNow($('#door'), "bounceOut");
	$('#door').classList.remove('hidden');
	addAnimation($('#door'), "bounceIn");
});

$('.dialog button').addEventListener('pointerdown',function(){
	removeTimer();
	clearInterval(timer);
	setTimeout(()=>{
		addAnimation($('.newgame'), "zoomOut");
		$('.newgame').style.animationDelay = '0s';
		removeAnimationNow($('table'), "flipInX");
		addAnimation($('table'), "flipOutX");
		addAnimation($('#door'), 'bounceOut');
		$('.buttons.size').classList.remove('hidden');
		setTimeout(()=>{
			removeAnimationNow($('.buttons.size'), "fadeOut");
			$('.buttons.size').classList.remove('hidden');
			addAnimation($('.buttons.size'), "fadeIn");
		},200);
		animateButtons($('#small'),$('#large'));
		setTimeout(()=>{
			animatePicsIn();
		},1000);
	},1000);
});

$('.newgame').addEventListener('animationend', function(e){
	if(e.animationName == 'zoomOut') {
		removeAnimationNow(this, e.animationName);
		this.classList.add('hidden');
		this.classList.add('animated');
		this.style.animationDelay='';
		//$('.timernum').innerHTML = '15';
		$('.timer').style.width = '100%';
	}
});

function generateTimer(){
	$('.cont').style.width = '145px';
	setTimeout(()=>{
		const span = document.createElement("span");
		span.classList.add('timernum');
		span.innerHTML = '15';
		$('.cont').appendChild(span);
	},1000);
}

function removeTimer(){
	$('.timernum').remove();
	$('.cont').style.width = '';
}