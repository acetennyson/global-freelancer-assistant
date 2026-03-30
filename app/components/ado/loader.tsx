import "./loader.css"

const valid = [
    "stack",
    "dot-translate",
    "factory-stack",
    "motion-bars"

]

export default function Loader({ style }: {style: string}) {
    if(!valid.length) throw new Error("no animation style listed");
    
    return <>
        <div className="w-full h-full flex justify-center items-center">
            <div className={`loader-${style}`}></div>
        </div>
    </>
}