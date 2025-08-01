<template>
  <div id="app_container" class="container mx-auto p-4 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
    <div class="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
      <!-- User Header -->
      <div v-if="user.email" class="text-right text-sm text-gray-600 mb-4">
        <span>Welcome, {{ user.email }}</span>
        <a href="/.gcp/api/auth/logout" class="ml-2 text-blue-500 hover:underline">[Logout]</a>
      </div>
      <div v-else class="text-right text-sm text-gray-600 mb-4">
        <span class="italic">Loading user...</span>
      </div>

      <h1 class="text-4xl font-extrabold mb-8 text-center text-red-500">Organizador personal</h1>

      <!-- Input and Add Button Section -->
      <div class="flex mb-6 space-x-2">
        <input
          type="text"
          v-model="newTodoText"
          @keyup.enter="addTodo"
          placeholder="Add a new todo..."
          class="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        <button
          @click="addTodo"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
        >
          Add
        </button>
      </div>

      <!-- ToDo List Section -->
      <ul class="divide-y divide-gray-200">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @toggle-complete="toggleComplete"
          @delete-todo="deleteTodo"
        />
      </ul>

      <!-- Empty State Message -->
      <p v-if="todos.length === 0" class="text-center text-gray-500 mt-6 text-lg">
        No todos yet. Start by adding one above!
      </p>
    </div>
  </div>
</template>

<script>
import TodoItem from './components/TodoItem.vue';

export default {
  name: 'App',
  components: {
    TodoItem,
  },
  data() {
    return {
      todos: [],
      newTodoText: '',
      backendUrl: process.env.VUE_APP_API_URL || '/api',
      // This will be populated with the logged-in user's info from IAP
      user: {
        email: null,
      },
    };
  },
  // Lifecycle hook: called after the instance is created.
  // Perfect for fetching initial data.
  async created() {
    await this.fetchUser();
    if (this.user.email) {
      this.fetchTodos();
    }
  },
  methods: {
    /**
     * Creates a headers object with the simulated user email for local development.
     * In a real IAP environment, this header is added by the proxy.
     */
    getApiHeaders() {
      const headers = {};
      // For local development, we simulate the IAP header using an environment variable.
      if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_DEV_USER_EMAIL) {
        headers['x-user-email'] = process.env.VUE_APP_DEV_USER_EMAIL;
      }
      return headers;
    },
    /**
     * Fetches the logged-in user's profile info from the backend.
     * The backend gets this information from the IAP headers.
     */
    async fetchUser() {
      try {
        const response = await fetch(`${this.backendUrl}/user/me`, { headers: this.getApiHeaders() });
        if (!response.ok) throw new Error('Could not fetch user profile.');
        this.user = await response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    },
    /**
     * Fetches all todo items from the backend API.
     */
    async fetchTodos() {
      try {
        // The backend knows the user from the IAP header, so no user ID is needed in the URL.
        const response = await fetch(`${this.backendUrl}/todos`, { headers: this.getApiHeaders() });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.todos = await response.json();
      } catch (error) {
        console.error("Error fetching todos:", error);
        // Optionally, display an error message to the user
      }
    },

    /**
     * Adds a new todo item to the list via the backend API.
     */
    async addTodo() {
      // Prevent adding empty todos
      if (this.newTodoText.trim() === '') {
        console.warn("Attempted to add an empty todo.");
        return;
      }

      const newTodo = {
        title: this.newTodoText.trim(),
        completed: false, // New todos are always uncompleted by default
      };

      try {
        const response = await fetch(`${this.backendUrl}/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getApiHeaders(),
          },
          body: JSON.stringify(newTodo),
        });

        if (!response.ok) {
          // Attempt to parse error message from backend if available
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || errorData.message}`);
        }

        const addedTodo = await response.json();
        this.todos.push(addedTodo); // Add the newly created todo (with ID) to the local list
        this.newTodoText = ''; // Clear the input field
      } catch (error) {
        console.error("Error adding todo:", error);
        // Optionally, display an error message to the user
      }
    },

    /**
     * Toggles the completion status of a todo item.
     * @param {number} id - The ID of the todo item to toggle.
     */
    async toggleComplete(id) {
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      if (todoIndex === -1) {
        console.warn(`Todo with ID ${id} not found for toggling.`);
        return;
      }

      // Create a copy to avoid direct mutation before API confirmation
      const todoToUpdate = { ...this.todos[todoIndex] };
      todoToUpdate.completed = !todoToUpdate.completed;

      try {
        const response = await fetch(`${this.backendUrl}/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...this.getApiHeaders(),
          },
          body: JSON.stringify({ completed: todoToUpdate.completed }), // Only send the 'completed' status
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || errorData.message}`);
        }

        // Update local state only after successful API call
        this.todos[todoIndex].completed = todoToUpdate.completed;
      } catch (error) {
        console.error("Error toggling todo completion:", error);
        // Revert local state if API call failed (optional, for better UX)
        // this.todos[todoIndex].completed = !todoToUpdate.completed;
      }
    },

    /**
     * Deletes a todo item from the list via the backend API.
     * @param {number} id - The ID of the todo item to delete.
     */
    async deleteTodo(id) {
      try {
        const response = await fetch(`${this.backendUrl}/todos/${id}`, {
          method: 'DELETE',
          headers: this.getApiHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || errorData.message}`);
        }

        // Remove the todo from the local list after successful API call
        this.todos = this.todos.filter(todo => todo.id !== id);
      } catch (error) {
        console.error("Error deleting todo:", error);
        // Optionally, display an error message to the user
      }
    },
  },
};
</script>

<style>
/* frontend/src/App.vue styles */
/* Base Tailwind CSS imports handled by main.css */

/* Custom styles for the app container and centering */
.container {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
