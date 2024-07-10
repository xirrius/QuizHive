import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { RootState } from "../state/store";
import { LoadingSpinner } from "../components/ui/loading";

interface Quiz {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface QuizWithScore extends Quiz {
  score: number;
}


const Stats = () => {

      const navigate = useNavigate();
      const scores = useSelector((state: RootState) => state.score);
      const [quizzes, setQuizzes] = useState<QuizWithScore[]>([]);
      const [loading, setLoading] = useState(true);


    useEffect(() => {
      const fetchQuizzes = async () => {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const fetchedQuizzes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          score: scores[doc.id],
        })) as QuizWithScore[];

        setQuizzes(fetchedQuizzes);
        setLoading(false);
        console.log(quizzes);
      };
      fetchQuizzes();
    }, []);

  return (
    <div>
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
        <h1 className="text-2xl sm:text-4xl text-center text-red-500 font-bold font-serif pb-4 ">
          Your Score Statistics
        </h1>
        <p className="text-sm sm:text-md text-center font-mono my-2 mx-4 sm:mx-24 md:mx-16">
          Note: These scores are based on the result of the latest attempt
          taken.
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner className="text-red-500"></LoadingSpinner>
        </div>
      ) : (
        <div className="flex-col">
          {quizzes.map((quiz) => (
            <div
              className="bg-indigo-300 m-4  rounded-xl shadow-lg flex flex-col md:flex-row items-center mx-12 sm:mx-24 md:mx-12 lg:mx-28 transition-all duration-500 hover:scale-105 hover:shadow-2xl my-12"
              key={quiz.id}
            >
              <img
                src={quiz.image}
                alt="quiz_img"
                className="w-full h-60 rounded-t-xl md:w-56 md:h-40 md:rounded-l-xl"
              />
              <div className="flex flex-col md:flex-row items-center justify-between w-full pr-8 gap-4">
                <div className="ml-4 md:ml-12">
                  <h3 className="text-center md:text-left font-bold text-2xl mb-3 mt-3">
                    {quiz.title}
                  </h3>
                  <p className="text-center md:text-left text-sm max-w-96">
                    {quiz.description}
                  </p>
                </div>
                <p className="font-bold ml-4 md:ml-12 mb-4">
                  Current Score: {quiz.score}/10
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Stats