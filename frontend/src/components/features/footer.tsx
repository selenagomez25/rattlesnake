import Container from "../global/container";

const Footer = () => {
    return (
        <footer className="w-full mt-auto flex flex-col items-center justify-center border-t border-border/10 py-6">
            <Container className="w-full flex justify-center">
                <p className="text-sm text-muted-foreground text-center">
                    &copy; {new Date().getFullYear()} rattlesnake. All rights reserved.
                </p>
            </Container>
        </footer>
    )
};

export default Footer;
