import CompletedCampaigns from "./campaigns/CompletedCampagins";
import CurrentCampaigns from "./campaigns/CurrentCampaigns";
import SupportCampaigns from "./campaigns/SupportCampagins";

export default function CampaignsPage() {
  return (
    <div>
      <div>
        <SupportCampaigns />
      </div>
      <div>
        <CurrentCampaigns />
      </div>
      <div>
        <CompletedCampaigns />
      </div>
    </div>
  );
}
