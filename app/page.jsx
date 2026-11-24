import BootScreen from "@/components/BootScreen";
import Journey from "@/components/Journey";
import Profile from "@/components/Profile";
import WorkSection from "@/components/work/WorkSection";
import Waves from "@/components/Waves";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <BootScreen />
      <Journey />
      <Profile />
      <WorkSection />
      <Waves />
      <Contact />
    </>
  );
}
