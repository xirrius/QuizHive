import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { Button } from "../ui/button";
import { setScore } from "../../state/score/scoreSlice";

interface Question {
  question: string;
  options: string[];
  correctOption: string;
}

interface Quiz {
  title: string;
  id: string;
  questions: Question[];
}

const QuizComponent = () => {
  const navigate = useNavigate()
  const { uid } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizEnded, setQuizEnded] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if(id) {
        const snapshot = await getDoc(doc(db, "quizzes", id));
        if (snapshot.exists()) {
          const quizData = snapshot.data() as Quiz;
          setQuiz(quizData);
          console.log(quiz);
        } else {
          console.log(`No such document!`);
        }   
      } else {
        console.log(`Quiz Id is not defined!`);
        
      }
    };
    fetchQuiz();
  }, [id]);

  const startQuiz = () => {
    setShowGuidelines(false);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = async () => {
    if (quiz && selectedOption !== null) {
      let updatedScore = currentScore
      if (
        selectedOption === quiz.questions[currentQuestionIndex].correctOption
      ) {
        updatedScore += 1
      }
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentScore(updatedScore)
      } else {
        setQuizEnded(true);
        await updateScoreInFirestore(updatedScore);
        setCurrentScore(updatedScore)
      }
      setSelectedOption(null);
    }
  };

  const updateScoreInFirestore = async (score: number) => {
    if(uid && id) {
      await updateDoc(doc(db, "userScores", uid), {
        [id]: score,
      });
      dispatch(setScore({ quizId:id, score }));
    } else {
      console.log(`User ID or Quiz ID is not defined.`);
      
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900 text-white py-8 shadow-2xl sticky top-0 z-10">
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
          {quiz?.title} Quiz
        </h1>
      </div>
      {showGuidelines ? (
        <div className="flex flex-col justify-center items-center w-full mt-6 gap-5">
          <h1 className="text-2xl sm:text-4xl font-bold my-4 text-center">
            Guidelines
          </h1>
          <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-2/3">
            <p className="mb-3">
              1. Make sure to complete the entire quiz in one go, otherwise it
              will not be considered a valid attempt.
            </p>
            <p className="mb-3">
              2. Select an option and click on 'Next' to move to the next
              question.
            </p>
            <p className="mb-3">
              3. You CANNOT go back and change your selection so choose wisely.
            </p>
            <p className="mb-2">
              4. Once the quiz is over the final result will be displayed on the
              screen.
            </p>
          </div>
          <div className="flex gap-8 mt-4 md:mt-16 mb-4">
            <Button
              onClick={() => navigate(-1)}
              className="rounded-full w-24 bg-red-500 hover:bg-red-400"
            >
              Go Back
            </Button>
            <Button onClick={startQuiz} className="rounded-full w-24">
              Start Quiz
            </Button>
          </div>
        </div>
      ) : quizEnded ? (
        <div className="flex justify-center items-center mt-24">
          <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-2/3 text-center">
            <h1 className="text-2xl sm:text-4xl font-bold my-4">
              Quiz Has Ended
            </h1>
            <p className="my-8 font-bold">
              Your final score is <br />
              <span
                className={`text-5xl ${
                  currentScore > 7
                    ? "text-green-400"
                    : currentScore > 4
                    ? "text-yellow-400"
                    : "text-red-500"
                }`}
              >
                {currentScore}/10
              </span>
            </p>
            <p
              className={`${
                currentScore > 7
                  ? "text-green-400"
                  : currentScore > 4
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            >
              {currentScore > 7
                ? "Great job! Keep it up!"
                : currentScore > 4
                ? "Good job! You can do better."
                : "You might need to work on this topic."}
            </p>
            <Link to={`/`}>
              <Button className="mt-6 rounded-full w-28">Go Back</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-8 bg-slate-200 m-8 rounded-lg shadow-lg mt-16">
            <p className="font-bold text-xl mb-4">
              Question {currentQuestionIndex + 1}
            </p>
            <p className="text-lg mb-3">
              {quiz?.questions[currentQuestionIndex].question}
            </p>
            <ul>
              {quiz?.questions[currentQuestionIndex].options.map(
                (option, idx) => (
                  <li
                    key={option}
                    onClick={() => handleOptionSelect(idx.toString())}
                    className={`cursor-pointer mb-2 hover:bg-blue-400 rounded-md p-2 ${
                      selectedOption == idx.toString() ? "bg-blue-400" : ""
                    }`}
                  >
                    <b>{idx + 1}.</b> {option}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className="rounded-full w-24 mx-8 mb-4 "
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuizComponent;
