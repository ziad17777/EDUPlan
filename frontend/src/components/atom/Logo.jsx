import { Link } from "react-router-dom";
export default function Logo({ sizeIcon = 48, sizeText = "lg" }) {
  return (
    <Link to="/">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 text-primary">
          <svg
            fill="none"
            viewBox={`0 0 ${sizeIcon} ${sizeIcon}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_6_535)">
              <path
                clip-rule="evenodd"
                d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                fill="currentColor"
                fill-rule="evenodd"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_6_535">
                <rect fill="white" height={sizeIcon} width={sizeIcon}></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
        <h2 className={`text-${sizeText} font-bold text-white`}>eduplan</h2>
      </div>
    </Link>
  );
}
