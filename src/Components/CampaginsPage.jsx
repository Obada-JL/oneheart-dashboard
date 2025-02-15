import CompletedCampaigns from "./campaigns/CompletedCampagins";
import CurrentCampaigns from "./campaigns/CurrentCampaigns";

export default function CampaginsPage() {
  return (
    <div>
      <div>
        <CurrentCampaigns />
      </div>
      <div>
        <CompletedCampaigns />
      </div>
    </div>
  );
}
