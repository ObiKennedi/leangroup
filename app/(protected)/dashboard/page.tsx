import UserOrders from "@/components/userOrders";
import "@/styles/Userdashboard.scss";

const UserDashboard = async () => {
    return (
        <main className="user-dashboard">
            <UserOrders />
        </main>
    );
};

export default UserDashboard;
