<template>
  <div>
    <h1>New Cocktail</h1>

    <p v-if="successMessage" style="color: green">
      {{ successMessage }}
      <router-link
        v-if="createdId"
        :to="{ name: 'CocktailDetails', params: { id: createdId } }"
      >View it</router-link>
    </p>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>

    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title:</label>
        <input type="text" v-model="form.title" id="title" required>
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="number" step="0.01" min="0" v-model="form.price" id="price" required>
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea v-model="form.description" id="description" required></textarea>
      </div>
      <div>
        <label for="glassType">Glass type (optional):</label>
        <input type="text" v-model="form.glassType" id="glassType">
      </div>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Saving...' : 'Submit' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'NewCocktail',
  data() {
    return {
      form: {
        title: '',
        price: '',
        description: '',
        glassType: ''
      },
      submitting: false,
      successMessage: null,
      errorMessage: null,
      createdId: null,
    };
  },
  methods: {
    async submitForm() {
      this.submitting = true;
      this.successMessage = null;
      this.errorMessage = null;
      this.createdId = null;
      try {
        const response = await fetch('http://localhost:3000/cocktails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        const body = await response.json();

        if (!response.ok) {
          const message = Array.isArray(body.message)
            ? body.message.join('; ')
            : body.message || 'Something went wrong. Please try again.';
          throw new Error(message);
        }

        this.successMessage = `Cocktail "${body.title}" created!`;
        this.createdId = body.id;
        this.form = { title: '', price: null, description: '', glassType: '' };
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* Optional: Add some basic styling */
form {
  max-width: 400px;
  margin: 0 auto;
}
div {
  margin-bottom: 10px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled { 
  background-color: #999; 
  cursor: not-allowed; 
}
button:hover {
  background-color: #0056b3;
}
</style>