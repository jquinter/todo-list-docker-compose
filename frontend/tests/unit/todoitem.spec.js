import { mount } from '@vue/test-utils';
import TodoItem from '@/components/TodoItem.vue';

describe('TodoItem.vue', () => {
  it('renders todo title correctly', () => {
    const todo = { id: 1, title: 'Test Todo', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('span').text()).toBe('Test Todo');
  });

  it('applies line-through style when todo is completed', async () => {
    const todo = { id: 1, title: 'Completed Todo', completed: true };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('span').classes()).toContain('line-through');

    await wrapper.setProps({ todo: { ...todo, completed: false } });
    expect(wrapper.find('span').classes()).not.toContain('line-through');
  });

  it('emits "toggle-complete" event when checkbox is clicked', async () => {
    const todo = { id: 1, title: 'Toggle Me', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    await wrapper.find('input[type="checkbox"]').trigger('change');
    expect(wrapper.emitted('toggle-complete')).toBeTruthy();
    expect(wrapper.emitted('toggle-complete')[0][0]).toBe(1); // Check emitted ID
  });

  it('emits "delete-todo" event when delete button is clicked', async () => {
    const todo = { id: 1, title: 'Delete Me', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('delete-todo')).toBeTruthy();
    expect(wrapper.emitted('delete-todo')[0][0]).toBe(1); // Check emitted ID
  });
});