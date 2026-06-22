import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, View } from "react-native";

import { IconRow, SectionHeader } from "@/components";
import type { ContactChannel, ContactLink } from "@/lib/masjids/profile/contactLinks";
import { useColors } from "@/lib/theme/useColors";

const META: Record<ContactChannel, { icon: keyof typeof Feather.glyphMap; labelKey: string }> = {
  phone: { icon: "phone", labelKey: "masjid.contact.call" },
  whatsapp: { icon: "message-circle", labelKey: "masjid.contact.whatsapp" },
  email: { icon: "mail", labelKey: "masjid.contact.email" },
  website: { icon: "globe", labelKey: "masjid.contact.website" },
};

/**
 * Contact section (design 20): one tappable row per channel the masjid actually
 * has — phone dials, WhatsApp opens a chat, email/website hand off to the OS.
 * Rows come from the pure `ContactLinks` builder, so a dead channel never shows.
 */
export function ContactSection({ links }: { links: ContactLink[] }) {
  const { t } = useTranslation();
  const c = useColors();

  if (links.length === 0) return null;

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.contact")} />
      <View className="gap-2">
        {links.map((link) => {
          const meta = META[link.key];
          return (
            <Pressable
              key={link.key}
              accessibilityRole="button"
              accessibilityLabel={`${t(meta.labelKey)}: ${link.display}`}
              onPress={() => void Linking.openURL(link.uri).catch(() => undefined)}
            >
              <IconRow
                icon={<Feather name={meta.icon} size={18} color={c.primary} />}
                title={t(meta.labelKey)}
                subtitle={link.display}
                trailing={<Feather name="chevron-right" size={18} color={c["text-muted"]} />}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default ContactSection;
