const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6">
      <div className="container mx-auto flex items-center justify-start">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg p-3 flex items-center justify-center w-16 h-16">
            <span className="text-primary font-bold text-3xl">M</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-light tracking-wide">LONDON BOROUGH OF</div>
            <div className="text-4xl font-bold">MERTON</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
