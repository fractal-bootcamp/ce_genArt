const GalleryPage = async () => {
  const configurations = await getConfigurations();
  return (
    <div className="grid grid-cols-3 gap-4">
      {configurations.map((config) => (
        <ConfigurationCard
          key={config.id}
          config={config}
          onLoad={() => loadConfiguration(config)}
        />
      ))}
    </div>
  );
};
