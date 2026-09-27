function StatusBanner({ offline }) {
  if (!offline) return null;

  return (
    <div className="status-banner">
      JSON Server is offline. The app is using local fallback data.
    </div>
  );
}

export default StatusBanner;
