const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-medium">
          <span>Cloudwick | Amorphic</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg p-3 flex items-center justify-center w-16 h-16">
            <span className="text-primary font-bold text-3xl">M</span>
          </div>
          <div className="text-center">
            <div className="text-sm font-light tracking-wide">LONDON BOROUGH OF</div>
            <div className="text-4xl font-bold">MERTON</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" 
            alt="AWS" 
            className="h-6 w-auto brightness-0 invert" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
