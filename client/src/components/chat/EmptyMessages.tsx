const EmptyMessages = () => {
  return (
    <div className="reveal flex flex-col items-center px-6 text-center">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-px w-10 bg-paper/15" />
        <span className="eyebrow">day one</span>
        <span className="h-px w-10 bg-paper/15" />
      </div>

      <h3 className="mt-5 font-display text-4xl leading-none">No messages yet</h3>

      <p className="mt-3 text-sm text-paper-dim max-w-sm">
        Start the conversation by sending your first message.
      </p>
    </div>
  );
};

export default EmptyMessages;
