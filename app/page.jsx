import BootScreen from "@/components/BootScreen";
import Journey from "@/components/Journey";
import Profile from "@/components/Profile";
import WorkSection from "@/components/work/WorkSection";
import Music from "@/components/Music";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <BootScreen />
      <Journey />
      <Profile />
      <WorkSection />
      <Music />
      <Contact />
    </>
  );
}
