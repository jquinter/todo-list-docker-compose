<template>
  <li
    class="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition duration-150 ease-in-out rounded-md mb-2 last:mb-0"
    :class="{ 'bg-gray-50': todo.completed }"
  >
    <div class="flex items-center flex-grow">
      <!-- Checkbox for toggling completion status -->
      <input
        type="checkbox"
        :aria-checked="todo.completed"
        :checked="todo.completed"
        @change="$emit('toggle-complete', todo.id)"
        class="form-checkbox h-6 w-6 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500 cursor-pointer"
      />
      <!-- Todo title with conditional line-through style -->
      <span
        class="ml-4 text-lg font-medium text-gray-800"
        :class="{ 'line-through text-gray-500': todo.completed }"
      >
        {{ todo.title }}
      </span>
    </div>
    <!-- Delete button -->
    <button
      @click="$emit('delete-todo', todo.id)"
      class="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-2 transition duration-150 ease-in-out transform hover:scale-110"
      aria-label="Delete todo"
    >
      <!-- SVG icon for delete (trash can) -->
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        ></path>
      </svg>
    </button>
  </li>
</template>

<script>
export default {
  name: 'TodoItem',
  props: {
    // Defines the 'todo' prop, which is an object representing a todo item.
    // It's required for the component to function.
    todo: {
      type: Object,
      required: true,
      validator: (value) => {
        // The ID can be a number (from DB) or string (from optimistic UI updates)
        return (typeof value.id === 'number' || typeof value.id === 'string') &&
               typeof value.title === 'string' &&
               typeof value.completed === 'boolean' &&
               'created_at' in value; // Check for presence of createdAt
      },
    },
  },
  // Declares the custom events this component can emit.
  // This is good practice for clarity and validation in Vue 3.
  emits: ['toggle-complete', 'delete-todo'],
};
</script>

<style scoped>
/* Scoped styles for TodoItem.vue */
/* No specific custom styles needed here as Tailwind classes handle most styling. */
/* The 'scoped' attribute ensures these styles only apply to this component. */
</style>
