<template>
  <div>
    <h1>Cocktail Details</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="cocktail">
      <h2>{{ cocktail.title }}</h2>
      <p><strong>Description:</strong> {{ cocktail.description }}</p>
      <p><strong>Glass type:</strong> {{ cocktail.glassType || 'n/a' }}</p>
      <p><strong>Price:</strong> {{ cocktail.price }}€</p>
      <router-link to="/">Back to list</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'CocktailDetails',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const cocktail = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchCocktail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/cocktails/${props.id}`,
        );
        const body = await response.json();
        if (!response.ok) {
          throw new Error(
            body.message || `HTTP error! status: ${response.status}`,
          );
        }
        cocktail.value = body;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchCocktail);

    return { cocktail, loading, error };
  },
};
</script>
