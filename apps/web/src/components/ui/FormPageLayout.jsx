export default function FormPageLayout({ children, aside }) {
  if (!aside) return <div>{children}</div>;

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">{children}</div>
      <div className="hidden xl:block w-[340px] shrink-0">
        <div className="sticky top-20">{aside}</div>
      </div>
    </div>
  );
}
