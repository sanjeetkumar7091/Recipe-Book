// Recipe Book JavaScript

// DOM Elements
const recipeForm = document.getElementById('recipe-form');
const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('recipe-modal');
const modalClose = document.getElementById('modal-close');
const modalRecipeName = document.getElementById('modal-recipe-name');
const modalRecipeImage = document.getElementById('modal-recipe-image');
const modalIngredients = document.getElementById('modal-ingredients');
const modalPreparation = document.getElementById('modal-preparation');

let recipes = [];

// Load recipes from localStorage
function loadRecipes() {
    const storedRecipes = localStorage.getItem('recipes');
    if (storedRecipes) {
        recipes = JSON.parse(storedRecipes);
    } else {
        recipes = [];
    }
}

// Save recipes to localStorage
function saveRecipes() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Render all recipes or filtered recipes
function renderRecipes(filteredRecipes = null) {
    const list = filteredRecipes || recipes;
    recipesContainer.innerHTML = '';

    if (list.length === 0) {
        recipesContainer.innerHTML = '<p>No recipes found.</p>';
        return;
    }

    list.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.tabIndex = 0;
        card.setAttribute('data-index', index);

        const img = document.createElement('img');
        img.className = 'recipe-image';
        img.alt = recipe.name;
        img.src = recipe.image || 'https://via.placeholder.com/300x160?text=No+Image';

        const info = document.createElement('div');
        info.className = 'recipe-info';

        const name = document.createElement('h3');
        name.className = 'recipe-name';
        name.textContent = recipe.name;

        info.appendChild(name);
        card.appendChild(img);
        card.appendChild(info);

        card.addEventListener('click', () => openModal(index));
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                openModal(index);
            }
        });

        recipesContainer.appendChild(card);
    });
}

// Open modal with recipe details
function openModal(index) {
    const recipe = recipes[index];
    if (!recipe) return;

    modalRecipeName.textContent = recipe.name;
    modalRecipeImage.src = recipe.image || 'https://via.placeholder.com/600x300?text=No+Image';
    modalIngredients.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient.trim();
        modalIngredients.appendChild(li);
    });
    modalPreparation.textContent = recipe.preparation;

    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
}

// Validate form inputs
function validateForm(data) {
    if (!data.name.trim()) {
        alert('Please enter a recipe name.');
        return false;
    }
    if (!data.ingredients.length) {
        alert('Please enter at least one ingredient.');
        return false;
    }
    if (!data.preparation.trim()) {
        alert('Please enter preparation steps.');
        return false;
    }
    return true;
}

// Handle image file input and convert to base64
function readImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject('Error reading image file');
        reader.readAsDataURL(file);
    });
}

// Handle form submission
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = recipeForm['recipeName'].value;
    const ingredientsRaw = recipeForm['ingredients'].value;
    const preparation = recipeForm['preparation'].value;
    const imageFile = recipeForm['image'].files[0];

    const ingredients = ingredientsRaw.split(',').map(i => i.trim()).filter(i => i);

    const formData = { name, ingredients, preparation };

    if (!validateForm(formData)) {
        return;
    }

    let imageData = null;
    try {
        imageData = await readImageFile(imageFile);
    } catch (error) {
        alert(error);
        return;
    }

    const newRecipe = {
        name,
        ingredients,
        preparation,
        image: imageData
    };

    recipes.push(newRecipe);
    saveRecipes();
    renderRecipes();

    recipeForm.reset();
});

// Search recipes by name or ingredient
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderRecipes();
        return;
    }
    const filtered = recipes.filter(recipe => {
        return recipe.name.toLowerCase().includes(query) ||
            recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query));
    });
    renderRecipes(filtered);
});

// Modal close event
modalClose.addEventListener('click', closeModal);

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize app
function init() {
    loadRecipes();
    renderRecipes();
}

init();
