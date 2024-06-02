const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
let speechSynthesisUtterance = null;

// event listeners
searchBtn.addEventListener('click', getMealList);
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getMealList();
    }
});


searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
    window.speechSynthesis.cancel();
});

// get meal list that matches with the ingredients
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => response.json())
        .then(data => {
            let html = "";
            if (data.meals) {
                data.meals.forEach(meal => {
                    html += `
                        <div class="meal-item" data-id="${meal.idMeal}">
                            <div class="meal-img">
                                <img src="${meal.strMealThumb}" alt="food">
                            </div>
                            <div class="meal-name">
                                <h3>${meal.strMeal}</h3>
                                <a href="#" class="recipe-btn">Get Recipe</a>
                            </div>
                        </div>
                    `;
                });
                mealList.classList.remove('notFound');
            } else {
                html = "Sorry, we didn't find any meal!";
                mealList.classList.add('notFound');
            }

            mealList.innerHTML = html;
        });
}

// get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals));
    }
}

// create a modal
function mealRecipeModal(meal) {
    meal = meal[0];
    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p id="recipe-instructions">${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
        <button id="speak-button">🔊 Speak Recipe</button>
        <button id="play-button">🔊 Play</button>
        <button id="pause-button">⏸️ Pause</button>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');

    // Add event listeners for the play and pause buttons
    document.getElementById('speak-button').addEventListener('click', () => {
        const instructions = document.getElementById('recipe-instructions').innerText;
        speakText(instructions);
    });
    document.getElementById('play-button').addEventListener('click', () => {
        const instructions = document.getElementById('recipe-instructions').innerText;
        playText(instructions);
    });
    document.getElementById('pause-button').addEventListener('click', pauseText);
}

// Play text function

function speakText(text) {
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US'; // Set the language
        speech.rate = 1; // Set the speed rate
        window.speechSynthesis.speak(speech);
    } else {
        alert("Sorry, your browser doesn't support text to speech!");
    }
}

function playText(text) {
    if ('speechSynthesis' in window) {
        if (!speechSynthesisUtterance || speechSynthesisUtterance.text !== text) {
            speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
            speechSynthesisUtterance.lang = 'en-US'; // Set the language
            speechSynthesisUtterance.rate = 1; // Set the speed rate
            window.speechSynthesis.speak(speechSynthesisUtterance);
        } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    } else {
        alert("Sorry, your browser doesn't support text to speech!");
    }
}

// Pause text function
function pauseText() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
    }
}
