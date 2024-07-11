import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { Button } from "../ui/button";
import { setScore } from "../../state/score/scoreSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
  const navigate = useNavigate();
  const { uid } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (id) {
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showGuidelines && !quizEnded) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setQuizEnded(true);
            updateScoreInFirestore(currentScore);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showGuidelines, quizEnded]);

  const startQuiz = () => {
    setShowGuidelines(false);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevSelectedOption = selectedOptions[currentQuestionIndex - 1];
      setSelectedOption(prevSelectedOption);
    }
  };

  const handleNextQuestion = async () => {
    if (quiz && selectedOption !== null) {
      let updatedScore = currentScore;
      const currentQuestion = quiz.questions[currentQuestionIndex];
      const isCorrect = selectedOption == currentQuestion.correctOption;
      const previousSelectedOption = selectedOptions[currentQuestionIndex];

      if (previousSelectedOption) {
        const wasCorrect =
          previousSelectedOption == currentQuestion.correctOption;
        if (isCorrect && !wasCorrect) {
          updatedScore += 1;
        } else if (!isCorrect && wasCorrect) {
          updatedScore -= 1;
        }
      } else if (isCorrect) {
        updatedScore += 1;
      }

      const updatedSelectedOptions = [...selectedOptions];
      updatedSelectedOptions[currentQuestionIndex] = selectedOption;
      setSelectedOptions(updatedSelectedOptions);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizEnded(true);
        await updateScoreInFirestore(updatedScore);
      }
      setCurrentScore(updatedScore);
      setSelectedOption(
        updatedSelectedOptions[currentQuestionIndex + 1] || null
      );
    }
  };

  const updateScoreInFirestore = async (score: number) => {
    if (uid && id) {
      await updateDoc(doc(db, "userScores", uid), {
        [id]: score,
      });
      dispatch(setScore({ quizId: id, score }));
    } else {
      console.log(`User ID or Quiz ID is not defined.`);
    }
  };

  const handleGoBack = () => {
    if (showGuidelines === false && quizEnded === false) {
      setShowDialog(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <main>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-3xl mb-2 text-center">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="py-4 text-center">
              Are you sure you want to exit the quiz? All your progress will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-16">
            <Button
              onClick={() => navigate(-1)}
              className="bg-red-500 hover:bg-red-400 text-white  px-4 py-2 rounded-full w-28"
            >
              Exit
            </Button>
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-gray-500 text-white  px-4 py-2 mr-2 rounded-full w-28"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-3xl mb-2">
              Correct Answers
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="overflow-auto max-h-96 flex flex-col gap-2">
                {quiz?.questions.map((ques, idx) => (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Question {idx + 1}.
                      </CardTitle>
                      <CardDescription className="font-medium text-lg text-black">
                        {ques.question}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                      {ques.options.map((option, idxx) => (
                        <p
                          className={`w-full ${
                            ques.correctOption == idxx.toString()
                              ? "border-green-500 border-2 bg-green-300"
                              : ""
                          } ${
                            selectedOptions[idx] == idxx.toString() &&
                            ques.correctOption != selectedOptions[idx]
                              ? "border-red-500 border-2 bg-red-300"
                              : ""
                          }  px-2 py-1 rounded-sm flex items-center`}
                        >
                          <span className="flex-grow">
                            {idxx + 1}. {option}
                          </span>
                          {selectedOptions[idx] == idxx.toString() &&
                          ques.correctOption != selectedOptions[idx] ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="16"
                              height="16"
                              viewBox="0 0 50 50"
                              className="ml-1" // Adjust the margin as needed
                            >
                              <path
                                d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z"
                                fill="red"
                              ></path>
                            </svg>
                          ) : (
                            <></>
                          )}
                          {ques.correctOption == idxx.toString() ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="16"
                              height="16"
                              viewBox="0 0 50 50"
                              className="ml-1" // Adjust the margin as needed
                            >
                              <path
                                d="M 25 2 C 12.317 2 2 12.317 2 25 C 2 37.683 12.317 48 25 48 C 37.683 48 48 37.683 48 25 C 48 20.44 46.660281 16.189328 44.363281 12.611328 L 42.994141 14.228516 C 44.889141 17.382516 46 21.06 46 25 C 46 36.579 36.579 46 25 46 C 13.421 46 4 36.579 4 25 C 4 13.421 13.421 4 25 4 C 30.443 4 35.393906 6.0997656 39.128906 9.5097656 L 40.4375 7.9648438 C 36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062 L 23.914062 30.554688 L 15.78125 22.96875 L 14.417969 24.431641 L 24.083984 33.447266 L 44.763672 9.046875 L 43.236328 7.7539062 z"
                                fill="green"
                              ></path>
                            </svg>
                          ) : (
                            <></>
                          )}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-16">
            <Button
              onClick={() => setShowModal(false)}
              className="bg-red-500 hover:bg-red-400 text-white  px-4 py-2 rounded-full w-28"
            >
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full mb-16">
        <div className="bg-slate-900 text-white py-8 shadow-2xl sticky top-0 z-10">
          <Button
            className="rounded-full w-10 h-10 m-4 bg-red-500 hover:bg-red-300 mx-4 sm:mx-24 md:mx-16"
            onClick={handleGoBack}
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
            {quiz?.title} Quiz
          </h1>

          <p
            className={`tracking-widest text-center font-bold mt-2 text-lg ${
              timeLeft <= 30
                ? timeLeft <= 10
                  ? "text-red-500"
                  : "text-yellow-400"
                : ""
            } ${!showGuidelines && !quizEnded ? "" : "hidden"}`}
          >
            Time Left:{" "}
            {`0${Math.floor(timeLeft / 60)}:${
              timeLeft % 60 < 10 ? "0" + (timeLeft % 60) : timeLeft % 60
            }`}
          </p>
        </div>

        {showGuidelines ? (
          <div className="flex flex-col justify-center items-center w-full mt-6 gap-5">
            <h1 className="text-2xl sm:text-4xl font-bold my-4 text-center">
              Guidelines
            </h1>
            <div className="bg-orange-100 p-6 rounded-lg shadow-lg w-2/3">
              <p className="mb-3 mt-2">
                1. Make sure to complete the entire quiz in{" "}
                <span className="font-bold">one go</span>, otherwise it will not
                be considered as a valid attempt.
              </p>
              <p className="mb-3">
                2. Select an option and click on{" "}
                <span className="font-bold">'Next'</span> to{" "}
                <span className="font-bold">save </span>
                your choice and <span className="font-bold">move </span> to the
                next question.
              </p>
              <p className="mb-3">
                3. You can <span className="font-bold">go back </span> and{" "}
                <span className="font-bold">change </span>
                your selection as long as you have not submitted the quiz.
              </p>
              <p className="mb-3">
                4. You will get <span className="font-bold">5 minutes</span> to
                complete the entire quiz. Once the time is up, the quiz will
                automatically end.
              </p>
              <p className="mb-2">
                5. Once the quiz is over the{" "}
                <span className="font-bold">final result </span> will be
                displayed on the screen.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-32 mt-4 md:mt-16 mb-4">
              <Button
                onClick={() => navigate(-1)}
                className="rounded-full w-64 sm:w-32 bg-red-500 hover:bg-red-400"
              >
                Go Back
              </Button>
              <Button onClick={startQuiz} className="w-64 rounded-full sm:w-32">
                Start Quiz
              </Button>
            </div>
          </div>
        ) : quizEnded ? (
          <div className="flex justify-center items-center mt-24 mb-20">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center my-7">
                <Button
                  className="rounded-full w-full sm:w-32 bg-blue-500 hover:bg-blue-400"
                  onClick={() => setShowModal(true)}
                >
                  See Answers
                </Button>
                <Link to={`/`} className="w-full sm:w-32">
                  <Button className="rounded-full w-full sm:w-32">
                    Go Back
                  </Button>
                </Link>
              </div>
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
            <div className="flex justify-between">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="rounded-full w-24 mx-8 mb-4 "
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className="rounded-full w-24 mx-8 mb-4 "
              >
                {currentQuestionIndex === 9 ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
export default QuizComponent;
