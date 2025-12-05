import { FormHeader } from "./FormHeader";
import { GoogleAuthButton } from "./GoogleButton";

import "@/styles/auth/CardWrapper.scss"

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    headerWriteUp: string;
    showBackLink?: boolean;
    backLinkHref?: string;
    backLinkWriteUp?: string;
    backLinkLabel?: string;
    showSocial?: boolean;
}

export const CardWrapper = ({
    children,
    headerLabel,
    headerWriteUp,
    showBackLink,
    backLinkHref,
    backLinkLabel,
    backLinkWriteUp,
    showSocial
}:CardWrapperProps) =>{
    return(
        <div className="card-wrapper">
            <FormHeader
                headerLabel={headerLabel}
                headerWriteUp={headerWriteUp}
            />
            {
                showSocial && (
                    <GoogleAuthButton/>
                )
            }
            <div>{children}</div>
            {
                showBackLink && (
                    <footer>{backLinkWriteUp} <a href={backLinkHref}>{backLinkLabel}</a></footer>
                )
            }
        </div>
    )
}