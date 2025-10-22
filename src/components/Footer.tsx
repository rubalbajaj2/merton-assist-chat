const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-4 px-6">
      <div className="container mx-auto flex items-center justify-end">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Amorphic</span>
          <span className="text-muted-foreground">|</span>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
            alt="AWS" 
            className="h-5 w-auto" 
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
