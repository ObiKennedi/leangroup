import "@/styles/auth/FormHeader.scss"

interface FormHeaderProps {
    headerLabel: string;
    headerWriteUp: string;
}

export const FormHeader = ({ headerLabel, headerWriteUp}: FormHeaderProps) =>{
    return(
        <header>
            <h2>{headerLabel}</h2>
            <p>{headerWriteUp}</p>
        </header>
    )
}