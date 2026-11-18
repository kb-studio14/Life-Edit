const ideas = [
  {
    title: 'Three recipes for this week',
    description: 'Try lemony white beans on toast, a sheet-pan vegetable dinner, or apple and cinnamon oats.',
  },
  {
    title: 'Your safari capsule wardrobe',
    description: 'Build around light layers in sand and olive. Start with a breathable shirt, loose trousers, and comfortable walking shoes.',
  },
  {
    title: 'A thoughtful birthday gift',
    description: 'Choose a small gift tied to a shared memory and write a note about why it made you think of them.',
  },
  {
    title: 'One small home upgrade',
    description: 'Give a favorite corner better light. Move a lamp closer to where you read or swap in a warmer bulb.',
  },
];

export function WeeklyEdit({ heading: Heading = 'h2' }: { heading?: 'h2' | 'h3' }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ideas.map(({ title, description }) => (
        <li key={title} className="rounded-xl border border-[#e0ddd3] bg-[#fffdf8] p-5 sm:p-6">
          <Heading className="font-serif text-2xl leading-tight tracking-tight">{title}</Heading>
          <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-[#565a50]">{description}</p>
        </li>
      ))}
    </ul>
  );
}
