import { Constants } from "../lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function MembersView() {
  const firstThreeMembers = Constants.InstitutionMembers.slice(0, 3);
  // three overlapping avatars
  return (
    <div className="grid grid-cols-3">
      {firstThreeMembers.map((member, index) => (
        <Avatar
          className="flex flex-col items-center justify-center"
          key={member.id}
          style={{ marginLeft: `-${index * 0.9}rem` }}
        >
          <AvatarImage
            src={member.profileImageSrc}
            alt={member.name}
            className="h-8 w-8 rounded-full border border-black"
            style={{
              position: "relative",
              zIndex: firstThreeMembers.length - index,
            }}
          />
          <AvatarFallback>
            {member.name.split(" ").map((name) => name[0]?.toUpperCase())}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
