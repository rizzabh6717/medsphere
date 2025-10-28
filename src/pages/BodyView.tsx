import NavigationHeader from "@/components/NavigationHeader";

const BodyView = () => {
  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8 flex-1 mb-auto">
        <div className="bg-white rounded-lg px-6 py-3 mb-6">
          <h1 className="text-3xl font-bold">Body View</h1>
          <p className="text-muted-foreground">Interactive human anatomy visualization</p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card bg-card border border-border">
          <iframe
            src="/anatomy-pointer/index.html"
            title="Anatomy Viewer"
            className="w-full h-[75vh]"
          />
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default BodyView;
