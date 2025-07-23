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

  it('does NOT apply line-through style when todo is uncompleted', () => {
    const todo = { id: 2, title: 'Uncompleted Todo', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('span').classes()).not.toContain('line-through');
  });

  it('checkbox is checked when todo is completed', () => {
    const todo = { id: 3, title: 'Checked Todo', completed: true };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true);
  });

  it('checkbox is unchecked when todo is uncompleted', () => {
    const todo = { id: 4, title: 'Unchecked Todo', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(false);
  });

  it('updates title when todo prop changes', async () => {
    const todo = { id: 5, title: 'Original Title', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('span').text()).toBe('Original Title');

    await wrapper.setProps({ todo: { ...todo, title: 'Updated Title' } });
    expect(wrapper.find('span').text()).toBe('Updated Title');
  });

  // If you have specific ARIA attributes for accessibility:
  it('qwas correct aria-checked attribute for checkbox', async () => {
    const todo = { id: 6, title: 'ARIA Test', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('input[type="checkbox"]').attributes('aria-checked')).toBe('false');

    await wrapper.setProps({ todo: { ...todo, completed: true } });
    expect(wrapper.find('input[type="checkbox"]').attributes('aria-checked')).toBe('true');
  });

  it('renders gracefully with an empty todo title', () => {
    const todo = { id: 7, title: '', completed: false };
    const wrapper = mount(TodoItem, {
      props: { todo },
    });
    expect(wrapper.find('span').text()).toBe(''); // Or whatever expected behavior for empty title
  });  
});