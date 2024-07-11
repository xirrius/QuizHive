import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { clearUser } from "../state/user/userSlice";
import { resetScores } from "../state/score/scoreSlice";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { LoadingSpinner } from "../components/ui/loading";
import toast from "react-hot-toast";
import { RootState } from "../state/store";


interface Category {
  id: string;
  name: string;
  image: string;
}

const Home = () => {
  const navigate = useNavigate()
  const user = useSelector((state:RootState) => state.user)
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false) 

  const dispatch = useDispatch();
  
  useEffect(() => {
    if(user.uid) {
      setIsLoggedIn(true)
    }
    const getCategories = async () => {
      const fetchCategories = async (): Promise<Category[]> => {
        const querySnapshot = await getDocs(collection(db, "categories"));
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
      };
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
      setLoading(false);
    };
    getCategories();
  }, [user.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      dispatch(resetScores());
      toast.success('Logout successful.')
      setIsLoggedIn(false)
    } catch (error) {
      console.error("error logging out", error);
    }
  };

  return (
    <>
      <main>
        <div>
          <div className="backdrop-blur-3xl text-white sticky top-0  z-10 p-2 flex justify-between items-center">
            <h1 className="font-nova text-3xl pl-12 sm:text-6xl mb-3 text-red-500 font-bold sm:mx-auto ">
              Quiz Hive
            </h1>
            {isLoggedIn ? (
              <>
                <Popover>
                  <PopoverTrigger>
                    {" "}
                    <div
                      className="w-24 h-24 flex justify-end p-6 cursor-pointer transition-all hover:scale-110 duration-300"
                    >
                      <img
                        src="./user.png"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-36 mr-5">
                    <div className="flex-col flex bg-red-400  rounded-2xl shadow-2xl">
                      <Button
                        className="bg-red-400 hover:bg-red-300"
                        onClick={() => navigate("/stats")}
                      >
                        Statistics
                      </Button>
                      <Button
                        className="bg-red-400 hover:bg-red-300"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={() => navigate("/login")}
                  className="rounded-full m-4 w-16 h-8 sm:h-10 text-sm sm:w-28 bg-red-500 hover:bg-red-300"
                >
                  Login
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-indigo-900 my-12 bg-slate-300 p-4 rounded-2xl shadow-lg mx-12 sm:mx-28 font-mono">
            Welcome to the ultimate quiz mania, Quiz Hive! Pick a quiz to take
            from any of the given categories, and put your knowledge to test!
          </p>

          {loading ? (
            <div className="flex justify-center items-center">
              <LoadingSpinner className="text-red-500"></LoadingSpinner>
            </div>
          ) : (
            <ul className="flex flex-wrap m-4 gap-16 justify-center items-center mb-20 mt-16">
              {categories.map((category) => (
                <Link
                  to={`/category/${category.id}`}
                  key={category.id}
                  className="text-white"
                >
                  <li
                    key={category.id}
                    className="shadow-lg bg-black rounded-2xl  transition-all duration-500 hover:scale-105 hover:shadow-2xl
              "
                  >
                    <img
                      src={category.image}
                      alt="category_image"
                      className="w-56 h-48 rounded-t-2xl"
                    />
                    <p className="p-4 text-center font-nova">{category.name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
};
export default Home;
