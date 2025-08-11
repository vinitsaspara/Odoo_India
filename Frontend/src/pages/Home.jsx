import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to Odoo India
        </h1>
        {isAuthenticated ? (
          <div>
            <p className="text-lg text-muted-foreground mb-4">
              Welcome back, {user?.name}!
            </p>
            <p className="text-sm text-muted-foreground">
              You are successfully logged in.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-muted-foreground mb-4">
              Please log in to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
