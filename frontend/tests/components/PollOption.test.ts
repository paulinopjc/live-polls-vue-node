import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import PollOption from '@/components/polls/PollOption.vue'

const baseProps = {
  option: { id: 1, label: 'Pizza', position: 0 },
  count: 0,
  totalVotes: 0,
  hasVoted: false,
  isMyVote: false,
}

describe('PollOption', () => {
  it('renders the label', () => {
    const wrapper = mount(PollOption, { props: baseProps })
    expect(wrapper.text()).toContain('Pizza')
  })

  it('does not show counts before voting', () => {
    const wrapper = mount(PollOption, { props: baseProps })
    expect(wrapper.text()).not.toContain('%')
  })

  it('shows percentage after voting', () => {
    const wrapper = mount(PollOption, {
      props: { ...baseProps, count: 3, totalVotes: 6, hasVoted: true },
    })
    expect(wrapper.text()).toContain('50%')
    expect(wrapper.text()).toContain('3')
  })

  it('emits vote with option id when clicked', async () => {
    const wrapper = mount(PollOption, { props: baseProps })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('vote')).toBeTruthy()
    expect(wrapper.emitted('vote')![0]).toEqual([1])
  })

  it('disables the button when hasVoted is true', () => {
    const wrapper = mount(PollOption, {
      props: { ...baseProps, hasVoted: true },
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('shows the indigo ring on the user’s own vote', () => {
    const wrapper = mount(PollOption, {
      props: { ...baseProps, hasVoted: true, isMyVote: true },
    })
    expect(wrapper.classes()).toContain('ring-2')
  })
})