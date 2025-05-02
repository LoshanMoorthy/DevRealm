import { Box, Flex, Link, Heading, useColorModeValue } from "@chakra-ui/react";
import { NavLink as RouterLink } from "react-router-dom";

export const TopNav = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const text = useColorModeValue("gray.800", "whiteAlpha.900");
  const activeColor = useColorModeValue("teal.600", "teal.300");

  return (
    <Box bg={bg} px={6} py={4} mb={4} boxShadow="sm">
      <Flex justify="space-between" align="center">
        <Heading size="md" color={text}>
          🧠 DevRealm
        </Heading>
        <Flex gap={6}>
          <Link
            as={RouterLink}
            to="/"
            fontWeight="semibold"
            color={text}
            _hover={{ textDecoration: "underline", color: activeColor }}
          >
            Snippets
          </Link>
          <Link
            as={RouterLink}
            to="/graph"
            fontWeight="semibold"
            color={text}
            _hover={{ textDecoration: "underline", color: activeColor }}
          >
            Graph
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};
