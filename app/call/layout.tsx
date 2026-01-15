interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <div className="h-screen bg-black flex items-center justify-center">
            {children}
        </div>
    )
}

export default Layout;