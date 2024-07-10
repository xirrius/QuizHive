import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { Button } from "../components/ui/button";
import { LoadingSpinner } from "../components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { DialogHeader } from "../components/ui/dialog";

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface Quiz {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface QuizWithScore extends Quiz {
  score: number;
}

const Category = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>();
  const scores = useSelector((state: RootState) => state.score);
  const [category, setCategory] = useState<Category>();
  const [quizzes, setQuizzes] = useState<QuizWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if(id) {
          const docRef = doc(db, "categories", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const categoryData = docSnap.data() as Category; // Cast to Category
            setCategory(categoryData);
            console.log(category);
          } else {
            console.log("Category not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    fetchCategory();
  }, [id]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = query(collection(db, "quizzes"), where("categoryId", "==", id));
      const querySnapshot = await getDocs(q);
      const fetchedQuizzes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        score: scores[doc.id] == null? '?': scores[doc.id],
      })) as QuizWithScore[];

      setQuizzes(fetchedQuizzes);
      setLoading(false);
      console.log(quizzes);
    };
    fetchQuizzes();
  }, [id]);

  const handleTakeQuiz = (quizId:string) => {
    if(!auth.currentUser) {
      setShowModal(true)
    } else {
      navigate(`/quiz/${quizId}`)
    }
  }

  const handleCloseDialog = () => {
    setShowModal(false);
  };

  return (
    <main>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-3xl mb-2 text-center">Login Required</DialogTitle>
            <DialogDescription className="py-4 text-center">
              You need to log in to take this quiz. Do you want to log in now?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-16">
            <Button onClick={handleCloseDialog} className="bg-gray-500 text-white  px-4 py-2 mr-2 rounded-full w-28">
              Cancel
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-red-500 hover:bg-red-400 text-white  px-4 py-2 rounded-full w-28">
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-slate-900 text-white pb-8 shadow-2xl sticky top-0 z-10">
        <Button
          className="rounded-full w-10 h-10 m-4 bg-red-500 hover:bg-red-300 mx-4 sm:mx-24 md:mx-16"
          onClick={() => navigate(-1)}
        >
          <svg
            fill="#000000"
            height="40px"
            width="40px"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 330 330"
            overflow="visible"
          >
            <path
              id="XMLID_6_"
              d="M165,0C74.019,0,0,74.019,0,165s74.019,165,165,165s165-74.019,165-165S255.981,0,165,0z M205.606,234.394
    c5.858,5.857,5.858,15.355,0,21.213C202.678,258.535,198.839,260,195,260s-7.678-1.464-10.606-4.394l-80-79.998
    c-2.813-2.813-4.394-6.628-4.394-10.606c0-3.978,1.58-7.794,4.394-10.607l80-80.002c5.857-5.858,15.355-5.858,21.213,0
    c5.858,5.857,5.858,15.355,0,21.213l-69.393,69.396L205.606,234.394z"
            />
          </svg>
        </Button>
        <h1 className="font-nova text-2xl sm:text-4xl text-center text-red-500 font-bold pb-4 ">
          {category?.name}
        </h1>
        <p className="font-mono text-sm sm:text-md text-center my-2 mx-4 sm:mx-24 md:mx-16">
          {category?.description}
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner className="text-red-500"></LoadingSpinner>
        </div>
      ) : (
        <div className="flex-col mb-32">
          {quizzes.map((quiz) => (
            <div
              className="bg-gray-100 m-4  rounded-xl shadow-lg flex flex-col md:flex-row items-center mx-12 sm:mx-24 md:mx-12 lg:mx-28 transition-all duration-500 hover:scale-105 hover:shadow-2xl my-12"
              key={quiz.id}
            >
              <img
                src={quiz.image}
                alt="quiz_img"
                className="w-full h-60 rounded-t-xl md:w-56 md:h-40 md:rounded-l-xl"
              />
              <div className="flex flex-col md:flex-row items-center justify-between w-full pr-8 gap-4">
                <div className="ml-4 md:ml-12">
                  <h3 className="font-nova text-center md:text-left font-bold text-2xl mb-3 mt-3">
                    {quiz.title}
                  </h3>
                  <p className="text-center md:text-left text-sm max-w-96">
                    {quiz.description}
                  </p>
                </div>
                <p className="font-bold ml-4 md:ml-12">
                  Current Score: {quiz.score}/10
                </p>
                {/* <Link to={`/quiz/${quiz.id}`} className=""> */}
                <Button
                  className="rounded-3xl w-32 md:w-24 my-4  ml-4 md:ml-12"
                  onClick={() => handleTakeQuiz(quiz.id)}
                >
                  Take Quiz
                </Button>
                {/* </Link> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
export default Category;
