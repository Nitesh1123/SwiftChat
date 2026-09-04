const EmptyMessages = () => {
  return (
    <>
      <div className="text-4xl mb-3">💬</div>

      <h3 className="text-lg font-semibold">No messages yet</h3>

      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Start the conversation by sending your first message.
      </p>
    </>
  );
};

export default EmptyMessages;
