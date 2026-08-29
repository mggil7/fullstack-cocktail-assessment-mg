<template>
  <div>
    <h1>Cocktails List</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
       <label for="search">Search by description:</label>
       <input type="text" id="search" v-model="search" placeholder="e.g. mint" />
      <ul>
        <li v-for="item in data" :key="item.id">
          <router-link :to="{ name: 'CocktailDetails', params: { id: item.id } }">
            <span style="font-weight: bold">{{ item.title }}</span>
          </router-link>
          price: {{ item.price }}€
        </li>
      </ul>
      <p v-if="data.length === 0">No cocktails match your search.</p>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

const SEARCH_DEBOUNCE_MS = 300;

export default {
  name: 'NewCocktail',
  setup() {
    const data = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const search = ref('');
    let debounceTimer = null;

    const fetchData = async () => {
      error.value = null;
      try {
        const params = search.value
          ? `?search=${encodeURIComponent(search.value)}`
          : '';
        const response = await fetch('http://localhost:3000/cocktails${params}');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        data.value = jsonData;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    watch(search, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchData, SEARCH_DEBOUNCE_MS);
    });

    onMounted(fetchData);

    return {
      data,
      loading,
      error,
      search
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>